package com.designhive.controller;

import com.designhive.entity.LearningPlan;
import com.designhive.service.LearningPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/learning-plans")
public class LearningPlanController {

    @Autowired
    private LearningPlanService learningPlanService;

    // Create a new Learning Plan
    @PostMapping
    public ResponseEntity<LearningPlan> createLearningPlan(@RequestBody LearningPlan plan) throws ExecutionException, InterruptedException {
        LearningPlan createdPlan = learningPlanService.createLearningPlan(plan);
        return ResponseEntity.ok(createdPlan);  // Return created learning plan with 200 OK status
    }

    // Get a specific Learning Plan by ID
    @GetMapping("/{id}")
    public ResponseEntity<LearningPlan> getLearningPlan(@PathVariable String id) throws ExecutionException, InterruptedException {
        LearningPlan plan = learningPlanService.getLearningPlanById(id);
        if (plan != null) {
            return ResponseEntity.ok(plan);  // Return the learning plan if found
        } else {
            return ResponseEntity.notFound().build();  // Return 404 if not found
        }
    }

    // Get all Learning Plans by a specific user ID
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<LearningPlan>> getLearningPlansByUser(@PathVariable String userId) throws ExecutionException, InterruptedException {
        List<LearningPlan> plans = learningPlanService.getLearningPlansByUserId(userId);
        return ResponseEntity.ok(plans);  // Return all learning plans for the user
    }

    // Update an existing Learning Plan
    @PutMapping("/{id}")
    public ResponseEntity<LearningPlan> updateLearningPlan(@PathVariable String id, @RequestBody LearningPlan plan) throws ExecutionException, InterruptedException {
        LearningPlan updatedPlan = learningPlanService.updateLearningPlan(id, plan);
        if (updatedPlan != null) {
            return ResponseEntity.ok(updatedPlan);  // Return updated learning plan
        } else {
            return ResponseEntity.notFound().build();  // Return 404 if not found
        }
    }

    // Delete a Learning Plan by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLearningPlan(@PathVariable String id) throws ExecutionException, InterruptedException {
        boolean deleted = learningPlanService.deleteLearningPlan(id);
        if (deleted) {
            return ResponseEntity.noContent().build();  // Return 204 No Content if deleted successfully
        } else {
            return ResponseEntity.notFound().build();  // Return 404 if not found
        }
    }
}
