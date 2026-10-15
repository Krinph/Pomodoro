package org.manage.backend.service;

import org.manage.backend.entity.History;
import org.manage.backend.mapper.HistoryMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;

@Service
public class HistoryService {
    @Autowired
    HistoryMapper historyMapper;

    public ArrayList<History> getHistory() {
        return historyMapper.getHistory();
    }

    @Transactional
    public boolean saveHistory(History history) {
        return (historyMapper.insertHistory(history) == 1);
    }

    @Transactional
    public boolean deleteHistory(int id) {
        return historyMapper.deleteHistory(id) == 1;
    }
}
