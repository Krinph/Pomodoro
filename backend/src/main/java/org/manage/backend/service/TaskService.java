package org.manage.backend.service;

import org.manage.backend.entity.Task;
import org.manage.backend.mapper.TaskMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;

@Service
public class TaskService {
    @Autowired
    TaskMapper taskMapper;

    public ArrayList<Task> getTasks() {
        return taskMapper.selectTasks();
    }

    @Transactional
    public boolean updateTask(Task task) {
        return taskMapper.UpdateTask(task) == 1;
    }

    @Transactional
    public boolean saveTask(Task task) {
        return taskMapper.InsertTask(task) == 1;
    }

    @Transactional
    public boolean deleteTask(int id) {
        return taskMapper.DeleteTask(id) == 1;
    }
}
