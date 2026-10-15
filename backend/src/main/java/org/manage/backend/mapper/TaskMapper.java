package org.manage.backend.mapper;

import org.manage.backend.entity.Task;
import java.util.ArrayList;

public interface TaskMapper {

    public ArrayList<Task> selectTasks();

    public int InsertTask(Task task);

    public int UpdateTask(Task task);

    public int DeleteTask(int id);
}
