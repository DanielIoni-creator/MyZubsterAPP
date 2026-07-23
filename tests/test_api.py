import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_generate_address():
    response = client.post(
        "/api/v1/generate-address",
        json={"order_id": "test-123", "amount": "1.0"}
    )
    assert response.status_code == 200
    assert "address" in response.json()

def test_payment_status():
    response = client.get("/api/v1/payment-status/test-123")
    assert response.status_code == 200
    assert "status" in response.json()
