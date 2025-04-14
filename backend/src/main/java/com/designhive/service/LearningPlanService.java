package com.designhive.service;

import com.designhive.entity.LearningPlan;
import com.designhive.entity.Task;
import com.designhive.repository.LearningPlanRepository;
import com.google.cloud.Timestamp;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ExecutionException;

@Service
public class LearningPlanService {

    @Autowired
    private LearningPlanRepository learningPlanRepository;

    // Method to generate a unique ID for tasks
    private String generateTaskId() {
        return UUID.randomUUID().toString(); // Generates a random UUID for each task
    }

    // Method to get the current timestamp in a formatted string
    private String getFormattedTimestamp() {
        Timestamp now = Timestamp.now();
        Date date = new Date(now.toSqlTimestamp().getTime());
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        return sdf.format(date);
    }

    // Method to calculate the progress of a learning plan based on task completion
    private int calculateProgress(LearningPlan plan) {
        List<Task> tasks = plan.getTasks();
        if (tasks == null || tasks.isEmpty()) return 0;

        long completed = tasks.stream().filter(Task::isCompleted).count();
        return (int) ((completed * 100.0f) / tasks.size());
    }

    // Create a new Learning Plan
    public LearningPlan createLearningPlan(LearningPlan plan) throws ExecutionException, InterruptedException {
        if (plan.getStatus() == null || plan.getStatus().isEmpty()) {
            plan.setStatus("planned");
        }

        String now = getFormattedTimestamp();
        plan.setCreatedAt(now);
        plan.setUpdatedAt(now);

        // Set default start date if not provided
        if (plan.getStartDate() == null || plan.getStartDate().isEmpty()) {
            plan.setStartDate(new SimpleDateFormat("yyyy-MM-dd").format(new Date()));
        }

        // ✅ Assign unique IDs to all tasks if missing
        if (plan.getTasks() != null) {
            for (Task task : plan.getTasks()) {
                if (task.getId() == null || task.getId().isEmpty()) {
                    task.setId(generateTaskId());
                }
            }
        }

        // Set calculated progress
        plan.setProgress(calculateProgress(plan));

        return learningPlanRepository.save(plan);
    }

    // Get a specific Learning Plan by ID
    public LearningPlan getLearningPlanById(String id) throws ExecutionException, InterruptedException {
        return learningPlanRepository.findById(id);
    }

    // Get all Learning Plans by a specific user ID
    public List<LearningPlan> getLearningPlansByUserId(String userId) throws ExecutionException, InterruptedException {
        return learningPlanRepository.findByUserId(userId);
    }

    // Update an existing Learning Plan
    public LearningPlan updateLearningPlan(String id, LearningPlan plan) throws ExecutionException, InterruptedException {
        LearningPlan existingPlan = learningPlanRepository.findById(id);
        if (existingPlan != null) {
            plan.setId(id);
            plan.setCreatedAt(existingPlan.getCreatedAt());
            plan.setUpdatedAt(getFormattedTimestamp());

            // ✅ Assign unique IDs to any tasks missing one
            if (plan.getTasks() != null) {
                for (Task task : plan.getTasks()) {
                    if (task.getId() == null || task.getId().isEmpty()) {
                        task.setId(generateTaskId());
                    }
                }
            }

            plan.setProgress(calculateProgress(plan)); // Recalculate on update
            return learningPlanRepository.save(plan);
        } else {
            return null;
        }
    }

    // Delete a Learning Plan by ID
    public boolean deleteLearningPlan(String id) throws ExecutionException, InterruptedException {
        return learningPlanRepository.deleteById(id);
    }

    // Add task to learning plan
    public LearningPlan addTask(String planId, Task task) throws ExecutionException, InterruptedException {
        LearningPlan plan = learningPlanRepository.findById(planId);
        if (plan == null) {
            return null; // Plan not found
        }

        task.setId(generateTaskId());  // Generate a unique ID for the task
        plan.getTasks().add(task);

        plan.setProgress(calculateProgress(plan));
        return learningPlanRepository.save(plan);
    }

    // Update task in learning plan
    public LearningPlan updateTask(String planId, String taskId, Task updatedTask) throws ExecutionException, InterruptedException {
        LearningPlan plan = learningPlanRepository.findById(planId);
        if (plan == null) {
            return null;
        }

        for (Task task : plan.getTasks()) {
            if (task.getId().equals(taskId)) {
                task.setTitle(updatedTask.getTitle());
                task.setDescription(updatedTask.getDescription());
                task.setCompleted(updatedTask.isCompleted());
                break;
            }
        }

        plan.setProgress(calculateProgress(plan));
        return learningPlanRepository.save(plan);
    }

    // Delete task from learning plan
    public boolean deleteTask(String planId, String taskId) throws ExecutionException, InterruptedException {
        LearningPlan plan = learningPlanRepository.findById(planId);
        if (plan == null) {
            return false;
        }

        boolean taskRemoved = plan.getTasks().removeIf(task -> task.getId().equals(taskId));

        if (taskRemoved) {
            plan.setProgress(calculateProgress(plan));
            learningPlanRepository.save(plan);
        }

        return taskRemoved;
    }
}
