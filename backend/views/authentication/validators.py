def validate_registration(data, User):
    response = {
        "passwords_match": True,
        "password_valid": True,
        "email_unique" : False,
        "email_valid" : True,
        "valid_data" : True
    }

    email = data.get("email")
    password = data.get("password")
    confirmation = data.get("passwordConfirmation")

    try:
        User.objects.get(email=email)
    except User.DoesNotExist:
        response["email_unique"] = True

    if password != confirmation:
        response["passwords_match"] = False
    
    if len(password) < 8:
        response["password_valid"] = False 

    return response