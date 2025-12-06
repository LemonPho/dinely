import random
import string
from backend.models import Reservation, Bill


def generate_reservation_code():
    """
    Generate a unique reservation code in format RES-###### (6 alphanumeric characters)
    """
    max_attempts = 100
    for _ in range(max_attempts):
        # Generate 6 random alphanumeric characters
        random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        code = f"RES-{random_part}"
        
        # Check if code already exists
        if not Reservation.objects.filter(code=code).exists():
            return code
    
    # If we couldn't generate a unique code after max_attempts, raise an error
    raise ValueError("Could not generate unique reservation code after multiple attempts")


def generate_bill_code():
    """
    Generate a unique bill code in format CUE-###### (6 alphanumeric characters)
    """
    max_attempts = 100
    for _ in range(max_attempts):
        # Generate 6 random alphanumeric characters
        random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        code = f"CUE-{random_part}"
        
        # Check if code already exists
        if not Bill.objects.filter(code=code).exists():
            return code
    
    # If we couldn't generate a unique code after max_attempts, raise an error
    raise ValueError("Could not generate unique bill code after multiple attempts")

