from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
import uuid
from datetime import timedelta
from django.utils import timezone


class UserManager(BaseUserManager):
    def create_user(self, email, password, name=None):
        if not email:
            raise ValueError('User must have a valid email')
        
        # Si no se proporciona name, usar el email como nombre
        if not name:
            name = email.split('@')[0]  # Usar la parte antes del @
        
        user = self.model(
            name=name,
            email=self.normalize_email(email),
        )
        
        user.set_password(password)
        user.save(using=self._db)
        
        return user
    
    def create_superuser(self, email, password):
        user = self.create_user(
            email,
            password,
        )
        user.is_admin = True
        user.is_staff = True      
        user.is_superuser = True
        user.save(using=self._db)
        return user

class User(AbstractUser):
    is_admin = models.BooleanField(default=False)
    is_waiter = models.BooleanField(default=False)
    is_kitchen = models.BooleanField(default=False)

    #Este sitio no usa usernames, sino nombres (si el usuario quiere ingresa un username)
    username = None 

    phone_number = models.CharField(max_length=16)
    name = models.CharField(max_length=32)
    email = models.EmailField('email address', unique=True)
    date_created = models.DateTimeField(null=True, auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    EMAIL_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return f"{self.name}"
    
    def has_module_perms(self, app_label):
        return self.is_admin
    
    def has_perm(self, perm, obj=None):
        return self.is_admin
    
    @property
    def is_employee(self):
        return self.is_kitchen or self.is_waiter

#Misma razon de existencia que PlateCategory
class TableArea(models.Model):
    label = models.CharField(max_length=64, unique=True)

class Table(models.Model):
    code = models.CharField(max_length=64, unique=True)
    capacity = models.PositiveIntegerField()
    state = models.CharField(max_length=64)
    area = models.ForeignKey(TableArea, on_delete=models.SET_NULL, related_name="tables", null=True)
    notes = models.CharField(max_length=2048, null=True, blank=True)
    class Meta:
        ordering = ["area"]

class Reservation(models.Model):
    client = models.ForeignKey(User, on_delete=models.SET_NULL, related_name="reservations", null=True, blank=True)
    # Tenemos informacion del cliente aqui directo por si hace una reservacion sin cuenta (mayoria de los casos)
    # Aunque haya un cliente asociado hay que popular esta informacion para consistencia
    name = models.CharField(max_length=64)
    email = models.CharField(max_length=64, null=True, blank=True)
    phone_number = models.CharField(max_length=16, null=True, blank=True)

    code = models.CharField(max_length=16) # RES-######
    date_time = models.DateTimeField()
    table = models.ForeignKey(Table, on_delete=models.SET_NULL, related_name="reservations", null=True)
    amount_people = models.PositiveIntegerField()
    state = models.CharField(max_length=64)
    notes = models.CharField(max_length=2048, null=True, blank=True)

#Asi el restaurante puede tener varios categorias y nos facilita obtener cuales son los categorias disponibles
class PlateCategory(models.Model):
    label = models.CharField(max_length=64, unique=True)

class Plate(models.Model):
    name = models.CharField(max_length=64)
    price = models.FloatField()
    category = models.ForeignKey(PlateCategory, on_delete=models.SET_NULL, related_name="plates", null=True)
    description = models.CharField(max_length=2048, null=True, blank=True)
    
    class Meta:
        ordering = ["category__label", "name"]

class Bill(models.Model):
    code = models.CharField(max_length=16) # CUE-######
    table = models.ForeignKey(Table, on_delete=models.SET_NULL, related_name="accounts", null=True)
    waiter = models.ForeignKey(User, on_delete=models.SET_NULL, related_name="accounts", null=True)
    date_time = models.DateTimeField(auto_now_add=True)
    state = models.CharField(max_length=64, default="current")
    total = models.FloatField(default=0)
    total_paid = models.FloatField(default=0)
    tip = models.IntegerField(default=0)

#Tabla de union entre cuentas y platos, es para tener varios platos en una cuenta
class BillPlate(models.Model):
    plate = models.ForeignKey(Plate, on_delete=models.CASCADE, related_name="accounts", null=True)
    account = models.ForeignKey(Bill, on_delete=models.CASCADE, related_name="plates", null=True)
    notes = models.CharField(max_length=1024)


class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reviews", null=False)
    content = models.TextField()
    score = models.PositiveSmallIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    title = models.CharField(max_length=100, blank=True, null=True)
    
    def __str__(self):
        return f"Review by {self.user.name}: {self.title or self.content[:30]}"
    
    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Review"
        verbose_name_plural = "Reviews"


class EmailValidationCode(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="email_validation_codes")
    code = models.UUIDField(unique=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    
    class Meta:
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['user']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"EmailValidationCode for {self.user.email} - {self.code}"
    
    def is_expired(self):
        """Check if the code has expired"""
        return timezone.now() > self.expires_at
    
    def is_valid(self):
        """Check if the code is valid (not expired and not used)"""
        return not self.is_expired() and not self.is_used
