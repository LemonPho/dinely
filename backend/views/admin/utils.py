import random
import string
from django.contrib.auth import get_user_model
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


def get_waiter_with_least_bills():
    """
    Find the waiter with the lowest number of current bills assigned.
    If multiple waiters have the same lowest count, randomly pick one.
    Returns None if no waiters are available.
    """
    User = get_user_model()
    
    # Get all waiters
    waiters = User.objects.filter(is_waiter=True, is_active=True)
    
    if not waiters.exists():
        return None
    
    # Count current bills for each waiter
    waiter_bill_counts = []
    for waiter in waiters:
        bill_count = Bill.objects.filter(waiter=waiter, state="current").count()
        waiter_bill_counts.append((waiter, bill_count))
    
    # Find the minimum bill count
    min_count = min(count for _, count in waiter_bill_counts)
    
    # Get all waiters with the minimum count
    waiters_with_min_count = [waiter for waiter, count in waiter_bill_counts if count == min_count]
    
    # Randomly pick one from waiters with minimum count
    if waiters_with_min_count:
        return random.choice(waiters_with_min_count)
    
    return None

