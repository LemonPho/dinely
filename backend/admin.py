from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth import get_user_model
from .models import (
    TableArea, Table, Reservation, PlateCategory, 
    Plate, Account, AccountPlate
)

User = get_user_model()

# Configuración personalizada para el modelo User
@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'name', 'is_admin', 'is_waiter', 'is_kitchen', 'is_active', 'date_created')
    list_filter = ('is_admin', 'is_waiter', 'is_kitchen', 'is_active', 'date_created')
    search_fields = ('email', 'name')
    ordering = ('email',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Información personal', {'fields': ('name', 'phone_number')}),
        ('Permisos', {'fields': ('is_admin', 'is_waiter', 'is_kitchen', 'is_active', 'is_staff', 'is_superuser')}),
        ('Fechas importantes', {'fields': ('date_created',)}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'name', 'password1', 'password2'),
        }),
    )

@admin.register(TableArea)
class TableAreaAdmin(admin.ModelAdmin):
    list_display = ('id', 'label')
    search_fields = ('label',)

@admin.register(Table)
class TableAdmin(admin.ModelAdmin):
    list_display = ('code', 'capacity', 'state', 'area', 'notes')
    list_filter = ('state', 'area')
    search_fields = ('code', 'notes')
    raw_id_fields = ('area',)

@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'email', 'date_time', 'amount_people', 'state', 'table', 'client')
    list_filter = ('state', 'date_time', 'table')
    search_fields = ('code', 'name', 'email', 'phone_number')
    raw_id_fields = ('client', 'table')
    date_hierarchy = 'date_time'

@admin.register(PlateCategory)
class PlateCategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'label')
    search_fields = ('label',)

@admin.register(Plate)
class PlateAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'category', 'description')
    list_filter = ('category',)
    search_fields = ('name', 'description')
    raw_id_fields = ('category',)

@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ('code', 'table', 'waiter', 'date_time', 'state', 'total', 'total_paid', 'tip')
    list_filter = ('state', 'date_time')
    search_fields = ('code',)
    raw_id_fields = ('table', 'waiter')
    date_hierarchy = 'date_time'

@admin.register(AccountPlate)
class AccountPlateAdmin(admin.ModelAdmin):
    list_display = ('id', 'plate', 'account', 'notes')
    list_filter = ('account',)
    search_fields = ('notes',)
    raw_id_fields = ('plate', 'account')