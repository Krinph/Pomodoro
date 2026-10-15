package org.manage.backend.controller;

import org.manage.backend.entity.History;
import org.manage.backend.entity.Result;
import org.manage.backend.entity.Task;
import org.manage.backend.service.HistoryService;
import org.manage.backend.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;

@RestController
public class ClockController {
    @Autowired
    private HistoryService historyService;
    @Autowired
    private TaskService taskService;

    @GetMapping("/api/tasks")
    public Result<ArrayList<Task>> getTasks() {
        try {
            ArrayList<Task> tasks = taskService.getTasks();
            return Result.success(200, tasks);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error(500, e.getMessage());
        }
    }

    @GetMapping("/api/history")
    public Result<ArrayList<History>> getHistory() {
        try {
            ArrayList<History> history = historyService.getHistory();
            return Result.success(200, history);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error(500, e.getMessage());
        }
    }

    @PostMapping("/api/tasks")
    public Result<String> addTask(@RequestBody Task task) {
        if (taskService.saveTask(task))
            return Result.success(200, "success");
        else
            return Result.error(500, "error");
    }

    @PutMapping("/api/tasks")
    public Result<String> reviseTask(@RequestBody Task task) {
        if (taskService.updateTask(task))
            return Result.success(200, "success");
        else
            return Result.error(500, "error");
    }

    @DeleteMapping("/api/tasks/{id}")
    public Result<String> deleteTask(@PathVariable int id) {
        if (taskService.deleteTask(id))
            return Result.success(200, "success");
        else
            return Result.error(500, "error");
    }

    @PostMapping("/api/history")
    public Result<String> saveHistory(@RequestBody History history) {
        if (historyService.saveHistory(history))
            return Result.success(200, "success");
        else
            return Result.error(500, "error");
    }

    @DeleteMapping("/api/history/{id}")
    public Result<String> deleteHistory(@PathVariable int id) {
        if (historyService.deleteHistory(id))
            return Result.success(200, "success");
        else
            return Result.error(500, "error");
    }
}
