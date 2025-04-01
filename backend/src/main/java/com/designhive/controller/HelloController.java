package com.designhive.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/")
public class HelloController {

    @GetMapping("/test")
    public String test() {
        return "🎉 Backend is working and Firebase is initialized!";
    }

    @GetMapping("/hello")
    public String hello() {
        return "Hello, World!";
    }
}
