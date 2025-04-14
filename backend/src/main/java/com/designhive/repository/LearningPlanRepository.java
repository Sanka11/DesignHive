package com.designhive.repository;

import com.designhive.entity.LearningPlan;
import com.designhive.entity.Task;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.concurrent.ExecutionException;

@Repository
public class LearningPlanRepository {

    private final Firestore firestore;

    @Autowired
    public LearningPlanRepository(Firestore firestore) {
        this.firestore = firestore;
    }

    private CollectionReference getLearningPlansCollection() {
        return firestore.collection("learningPlans");
    }

    // Save or update a learning plan
    public LearningPlan save(LearningPlan learningPlan) throws ExecutionException, InterruptedException {
        DocumentReference docRef = learningPlan.getId() == null ?
                getLearningPlansCollection().document() : getLearningPlansCollection().document(learningPlan.getId());

        // Set the learning plan document in Firestore
        ApiFuture<WriteResult> future = docRef.set(learningPlan);
        future.get();  // Wait for the operation to complete

        // Update the learning plan object with the Firestore document ID
        learningPlan.setId(docRef.getId());
        return learningPlan;
    }

    // Get a learning plan by its ID
    public LearningPlan findById(String id) throws ExecutionException, InterruptedException {
        DocumentSnapshot documentSnapshot = getLearningPlansCollection().document(id).get().get();
        if (documentSnapshot.exists()) {
            LearningPlan plan = documentSnapshot.toObject(LearningPlan.class);
            if (plan != null) {
                plan.setId(documentSnapshot.getId()); // ✅ Set the ID manually
            }
            return plan;
        } else {
            return null; // Return null if the document doesn't exist
        }
    }

    // Find learning plans by user ID
    public List<LearningPlan> findByUserId(String userId) throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> future = getLearningPlansCollection()
                .whereEqualTo("userId", userId)
                .get();

        QuerySnapshot querySnapshot = future.get();
        List<LearningPlan> plans = querySnapshot.toObjects(LearningPlan.class);

        // ✅ Set the IDs manually
        for (int i = 0; i < plans.size(); i++) {
            plans.get(i).setId(querySnapshot.getDocuments().get(i).getId());
        }

        return plans;
    }

    // Delete a learning plan by ID
    public boolean deleteById(String id) throws ExecutionException, InterruptedException {
        DocumentReference docRef = getLearningPlansCollection().document(id);
        ApiFuture<WriteResult> future = docRef.delete();
        future.get(); // Wait for the delete operation to complete
        return true;
    }

    // Add task to a learning plan
    public LearningPlan addTask(String planId, Task task) throws ExecutionException, InterruptedException {
        LearningPlan plan = findById(planId);
        if (plan == null) {
            return null; // Plan not found
        }

        task.setId(generateTaskId());
        plan.getTasks().add(task);

        return save(plan);
    }

    // Update task in a learning plan
    public LearningPlan updateTask(String planId, String taskId, Task updatedTask) throws ExecutionException, InterruptedException {
        LearningPlan plan = findById(planId);
        if (plan == null) {
            return null; // Plan not found
        }

        for (Task task : plan.getTasks()) {
            if (task.getId().equals(taskId)) {
                task.setTitle(updatedTask.getTitle());
                task.setDescription(updatedTask.getDescription());
                task.setCompleted(updatedTask.isCompleted());
                break;
            }
        }

        return save(plan);
    }

    // Delete task from a learning plan
    public boolean deleteTask(String planId, String taskId) throws ExecutionException, InterruptedException {
        LearningPlan plan = findById(planId);
        if (plan == null) {
            return false; // Plan not found
        }

        boolean taskRemoved = plan.getTasks().removeIf(task -> task.getId().equals(taskId));
        if (taskRemoved) {
            save(plan);
        }

        return taskRemoved;
    }

    // Generate unique task ID
    private String generateTaskId() {
        return Long.toString(System.currentTimeMillis()); // Simple ID based on timestamp
    }
}
