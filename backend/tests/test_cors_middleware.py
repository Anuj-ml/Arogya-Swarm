"""
Test CORS middleware integration
"""
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_cors_headers_on_root():
    """Test that CORS headers are present on root endpoint"""
    response = client.options(
        "/",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET"
        }
    )
    
    # Check that CORS headers are present
    assert "access-control-allow-origin" in response.headers
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"
    assert "access-control-allow-credentials" in response.headers
    assert response.headers["access-control-allow-credentials"] == "true"


def test_cors_headers_on_health():
    """Test that CORS headers are present on health endpoint"""
    response = client.options(
        "/health",
        headers={
            "Origin": "http://127.0.0.1:5173",
            "Access-Control-Request-Method": "GET"
        }
    )
    
    # Check that CORS headers are present
    assert "access-control-allow-origin" in response.headers
    assert response.headers["access-control-allow-origin"] == "http://127.0.0.1:5173"


def test_cors_headers_actual_request():
    """Test that CORS headers are present on actual GET request"""
    response = client.get(
        "/health",
        headers={"Origin": "http://localhost:5173"}
    )
    
    # Check response is successful
    assert response.status_code == 200
    
    # Check that CORS headers are present in actual response
    assert "access-control-allow-origin" in response.headers
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"


def test_cors_rejects_disallowed_origin():
    """Test that disallowed origins don't get CORS headers"""
    response = client.options(
        "/",
        headers={
            "Origin": "http://malicious.com",
            "Access-Control-Request-Method": "GET"
        }
    )
    
    # The response should not include the disallowed origin
    if "access-control-allow-origin" in response.headers:
        assert response.headers["access-control-allow-origin"] != "http://malicious.com"


if __name__ == "__main__":
    print("Running CORS middleware integration tests...")
    
    try:
        test_cors_headers_on_root()
        print("✓ test_cors_headers_on_root passed")
    except AssertionError as e:
        print(f"✗ test_cors_headers_on_root failed: {e}")
    
    try:
        test_cors_headers_on_health()
        print("✓ test_cors_headers_on_health passed")
    except AssertionError as e:
        print(f"✗ test_cors_headers_on_health failed: {e}")
    
    try:
        test_cors_headers_actual_request()
        print("✓ test_cors_headers_actual_request passed")
    except AssertionError as e:
        print(f"✗ test_cors_headers_actual_request failed: {e}")
    
    try:
        test_cors_rejects_disallowed_origin()
        print("✓ test_cors_rejects_disallowed_origin passed")
    except AssertionError as e:
        print(f"✗ test_cors_rejects_disallowed_origin failed: {e}")
    
    print("\nAll tests completed!")
