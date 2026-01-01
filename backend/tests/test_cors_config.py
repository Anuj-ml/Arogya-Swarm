"""
Test CORS configuration
"""
import os
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from core.config import Settings
from pydantic import Field


def test_cors_origins_default():
    """Test that default CORS origins include localhost and 127.0.0.1"""
    settings = Settings()
    
    # Check that default origins are set correctly
    assert "http://localhost:5173" in settings.CORS_ORIGINS
    assert "http://127.0.0.1:5173" in settings.CORS_ORIGINS
    assert "http://localhost:3000" in settings.CORS_ORIGINS
    
    # Check that cors_origins_list property works
    origins_list = settings.cors_origins_list
    assert "http://localhost:5173" in origins_list
    assert "http://127.0.0.1:5173" in origins_list
    assert "http://localhost:3000" in origins_list
    assert len(origins_list) == 3


def test_cors_origins_from_env():
    """Test that CORS_ORIGINS can be read from environment variable"""
    # Set environment variable
    os.environ["CORS_ORIGINS"] = "http://example.com,http://test.com"
    
    # Create new settings instance
    settings = Settings()
    
    # Check that env var is read
    assert settings.CORS_ORIGINS == "http://example.com,http://test.com"
    
    # Check that cors_origins_list property parses correctly
    origins_list = settings.cors_origins_list
    assert "http://example.com" in origins_list
    assert "http://test.com" in origins_list
    assert len(origins_list) == 2
    
    # Clean up
    del os.environ["CORS_ORIGINS"]


def test_cors_origins_list_strips_whitespace():
    """Test that cors_origins_list strips whitespace from origins"""
    os.environ["CORS_ORIGINS"] = "http://example.com , http://test.com , http://another.com"
    
    settings = Settings()
    origins_list = settings.cors_origins_list
    
    # Check that whitespace is stripped
    assert "http://example.com" in origins_list
    assert "http://test.com" in origins_list
    assert "http://another.com" in origins_list
    assert " http://test.com " not in origins_list
    
    # Clean up
    del os.environ["CORS_ORIGINS"]


if __name__ == "__main__":
    print("Running CORS configuration tests...")
    
    try:
        test_cors_origins_default()
        print("✓ test_cors_origins_default passed")
    except AssertionError as e:
        print(f"✗ test_cors_origins_default failed: {e}")
    
    try:
        test_cors_origins_from_env()
        print("✓ test_cors_origins_from_env passed")
    except AssertionError as e:
        print(f"✗ test_cors_origins_from_env failed: {e}")
    
    try:
        test_cors_origins_list_strips_whitespace()
        print("✓ test_cors_origins_list_strips_whitespace passed")
    except AssertionError as e:
        print(f"✗ test_cors_origins_list_strips_whitespace failed: {e}")
    
    print("\nAll tests completed!")
