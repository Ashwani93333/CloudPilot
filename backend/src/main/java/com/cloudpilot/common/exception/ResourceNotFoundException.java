package com.cloudpilot.common.exception;

import org.springframework.http.HttpStatus;

public class ResourceNotFoundException extends ApiException {

    public ResourceNotFoundException(String resourceName, String identifier) {
        super(String.format("%s with identifier '%s' was not found", resourceName, identifier),
              HttpStatus.NOT_FOUND, "RESOURCE_NOT_FOUND");
    }
}
