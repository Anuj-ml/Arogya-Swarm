"""
Test for Pydantic configuration to ensure it handles extra environment variables
"""
import pytest
import os
from backend.core.config import Settings


def test_settings_ignore_extra_env_vars():
    """Test that Settings class ignores extra environment variables from Docker Compose"""
    # Set some extra environment variables that Docker Compose might add
    os.environ['POSTGRES_USER'] = 'test_postgres'
    os.environ['POSTGRES_PASSWORD'] = 'test_password'
    os.environ['POSTGRES_DB'] = 'test_db'
    
    # Also set a valid setting
    os.environ['DATABASE_URL'] = 'postgresql://test:test@localhost:5432/test'
    
    try:
        # This should not raise a validation error
        settings = Settings()
        
        # Verify that the valid setting is loaded
        assert settings.DATABASE_URL == 'postgresql://test:test@localhost:5432/test'
        
        # Verify that the Settings object doesn't have the extra fields
        assert not hasattr(settings, 'POSTGRES_USER')
        assert not hasattr(settings, 'POSTGRES_PASSWORD')
        assert not hasattr(settings, 'POSTGRES_DB')
        
    finally:
        # Clean up environment variables
        os.environ.pop('POSTGRES_USER', None)
        os.environ.pop('POSTGRES_PASSWORD', None)
        os.environ.pop('POSTGRES_DB', None)
        os.environ.pop('DATABASE_URL', None)


def test_settings_accepts_valid_env_vars():
    """Test that Settings class still accepts valid environment variables"""
    # Set valid environment variables
    os.environ['APP_NAME'] = 'TestApp'
    os.environ['DEBUG'] = 'false'
    os.environ['LOG_LEVEL'] = 'DEBUG'
    
    try:
        settings = Settings()
        
        # Verify settings are loaded correctly
        assert settings.APP_NAME == 'TestApp'
        assert settings.DEBUG is False
        assert settings.LOG_LEVEL == 'DEBUG'
        
    finally:
        # Clean up
        os.environ.pop('APP_NAME', None)
        os.environ.pop('DEBUG', None)
        os.environ.pop('LOG_LEVEL', None)


def test_settings_config_has_extra_ignore():
    """Test that the model_config has extra='ignore' setting"""
    # Check that the model_config has the extra attribute set to 'ignore'
    assert hasattr(Settings, 'model_config')
    assert Settings.model_config.get('extra') == 'ignore'
