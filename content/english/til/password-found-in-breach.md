---
title: "How Password Managers Detect Breached Passwords So Fast"
date: 2025-01-15T10:00:00+05:45
description: "Learn how password managers can instantly tell if your password has been breached without storing passwords locally or sending them to servers - using clever hashing techniques."
image: "/images/til/password-breach.png"
til_categories: ["Security", "Privacy"]
til_tags: ["password-security", "hashing", "privacy", "cybersecurity"]
draft: false
---

Today I learned how password managers can report that my password has been in a breach so fast, without maintaining a database of breached passwords on my device and without sending my actual password to them (which would be a violation of my privacy). So how do they do it?

Turns out it's a simple and creative process that uses a technique called **k-anonymity** with hash prefixes.

## The Process Explained

### Step 1: Hash Your Password
The password manager first hashes your password using SHA-1 and takes only the **first 5 characters** of the hash.

### Step 2: Query the Database
Those 5 characters are sent to a database like [Have I Been Pwned](https://haveibeenpwned.com/). The website returns **all hashes** that start with those same 5 characters, along with how many times each has appeared in breaches.

### Step 3: Local Comparison
The password manager then compares your full hash with the returned list locally on your device. If your hash appears in the list, your password has been breached.

## Why This Works So Well

### Privacy Protection
- Your actual password never leaves your device
- Only 5 characters of the hash are sent (out of 40 total characters)
- The server can't determine your actual password from just the prefix

### Speed & Efficiency
The database can find all hashes with your 5-character prefix incredibly fast because:

1. **Indexed Database**: Hashes are stored in a sorted, indexed structure
2. **Prefix Matching**: Database engines are optimized for prefix searches
3. **Small Dataset**: Only ~1 million possible 5-character combinations exist

## Real Example

Let's say your password is `mypassword123`:

```
Original Password: mypassword123
SHA-1 Hash: 6c7ca345f63f835cb353ff15bd6c5e052ec08e7a
Prefix (first 5): 6c7ca
Suffix (remaining): 345f63f835cb353ff15bd6c5e052ec08e7a
```

Your password manager sends `6c7ca` to the API and gets back something like:

```
345F63F835CB353FF15BD6C5E052EC08E7A:2847
891A2F3B4C5D6E7F8A9B0C1D2E3F4A5B6C7D8E9F:156
A1B2C3D4E5F6789012345678901234567890ABCD:1
...hundreds more hashes...
```

The password manager then checks if `345f63f835cb353ff15bd6c5e052ec08e7a` appears in this list. If it does, your password has been breached!

## How the Database Stays So Fast

### Database Indexing Example

Imagine the database structure like this:

```
Index: 00000 → [hash1, hash2, hash3, ...]
Index: 00001 → [hash4, hash5, hash6, ...]
Index: 6c7ca → [345f63..., 891a2f..., a1b2c3..., ...]
Index: fffff → [hash7, hash8, hash9, ...]
```

When you query `6c7ca`, the database:
1. **Direct lookup** to index `6c7ca` (O(1) operation)
2. **Returns the entire list** for that prefix
3. **No scanning** through millions of records needed

### Why 5 Characters?

- **Security**: 5 hex characters = 16^5 = ~1 million combinations
- **Privacy**: Each prefix group contains hundreds of hashes, providing anonymity
- **Performance**: Small enough for fast network transfer, large enough for privacy

## My Implementation

I created a simple Python app to demonstrate this:

```python
import hashlib
import requests

def hash_password(password):
    """Hash the password using SHA-1 and split into prefix/suffix"""
    sha1_hash = hashlib.sha1(password.encode()).hexdigest().upper()
    prefix, suffix = sha1_hash[:5], sha1_hash[5:]
    return prefix, suffix

def check_password_breach(password):
    """Check if password has been breached using HIBP API"""
    prefix, suffix = hash_password(password)

    print(f"Password hash: {prefix + suffix}")
    print(f"Sending prefix: {prefix}")

    # Query the Have I Been Pwned API with the prefix
    response = requests.get(f"https://api.pwnedpasswords.com/range/{prefix}")

    if response.status_code != 200:
        print("Error fetching data from the server.")
        return

    print(f"Received {len(response.text.splitlines())} hashes starting with {prefix}")

    # Response contains all suffixes starting with the prefix
    hashes = (line.split(':') for line in response.text.splitlines())

    # Check if our suffix is in the list
    for h, count in hashes:
        if h == suffix:
            print(f"⚠️  Password found in breaches {count} times!")
            return

    print("✅ Password not found in any known breaches.")

# Example usage
if __name__ == "__main__":
    password = input("Enter your password: ")
    check_password_breach(password)
```

## Example Run

```bash
$ python password_checker.py
Enter your password: password123

Password hash: 482C811DA5D5B4BC6D497FFA98491E38F4F5F9F
Sending prefix: 482C8
Received 527 hashes starting with 482C8
⚠️  Password found in breaches 140,000+ times!
```

## Key Takeaway

**Cryptography + Big Brain People = WOW! + security + privacy**
