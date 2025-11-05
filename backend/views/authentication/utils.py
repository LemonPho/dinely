import re

def is_username_valid(username):
    # Regular expression pattern to check for unwanted characters
    pattern = r"^[a-zA-Z0-9_]+$"  # Allow only alphanumeric characters and underscores

    if re.match(pattern, username):
        return True
    else:
        return False
    
def is_email_valid(email):
    # Regular expression pattern for basic email validation
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"

    if re.match(pattern, email):
        return True
    else:
        return False