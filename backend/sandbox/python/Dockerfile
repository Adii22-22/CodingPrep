FROM python:3.11-slim

# No pip installs, no extra packages - submissions get the stdlib only.
# Keeps the image small and removes an entire class of "install a malicious
# package" concerns since there's no network access at runtime anyway.

WORKDIR /sandbox