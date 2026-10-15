package org.manage.backend.mapper;
import org.manage.backend.entity.History;

import java.util.ArrayList;

public interface HistoryMapper {

    public ArrayList<History> getHistory();

    public int insertHistory(History history);

    public int deleteHistory(int id);
}
