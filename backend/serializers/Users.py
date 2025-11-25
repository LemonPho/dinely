from rest_framework import serializers
from django.contrib.auth import get_user_model

#Esto se usa cuando se registra una cuenta de manera normal
class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})
    
    class Meta:
        model = get_user_model()
        fields = ['email', 'name', 'password']
        extra_kwargs = {
            'email': {'required': True},
        }
    
    def create(self, validated_data):
        User = get_user_model()
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

#cuando un admin crea la cuenta (no hay contraseña, el empleado en este caso lo pone despues)
class AdminUserCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ['email', 'name', 'is_admin', 'is_waiter', 'is_kitchen']   

    def create(self, validated_data):
        User = get_user_model()
        user = User(**validated_data)
        user.is_active = False
        user.set_unusable_password()  # Debe llamarse antes de save()
        user.save()
        #No permite el empleado entrar a su cuenta hasta que haga una contraseña
        #El empleado recibe un correo
        return user

class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ['id', 'name', 'email', 'is_admin', 'is_waiter', 'is_kitchen']

class UserReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ['id', 'email', 'name', 'is_admin', 'is_waiter', 'is_kitchen']


