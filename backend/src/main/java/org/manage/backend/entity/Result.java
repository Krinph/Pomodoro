package org.manage.backend.entity;

public class Result<T> {
    private int code;
    private String message;
    private T data;

    public Result() {}

    public static <T> Result<T> success(int code, T data) {
        Result<T> result = new Result<>();
        result.code = code;
        result.data = data;
        return result;
    }

    public static <T> Result<T> error(int code, String message) {
        Result<T> result = new Result<>();
        result.code = code;
        result.message = message;
        return result;
    }

    public int getCode() {
        return code;
    }

    public void setCode(int code) {
        this.code = code;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }
}
