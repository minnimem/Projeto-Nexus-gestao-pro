package br.com.diego.projectoads.exception;

public class BusinessException extends  RuntimeException{

    public  BusinessException(String msg){
        super((msg));
    }

}
