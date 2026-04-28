package br.com.diego.projectoads.service;

import br.com.diego.projectoads.config.Enum.PrioridadeEntrega;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

@Component
public class StringToPrioridadeEntregaConverter implements Converter<String, PrioridadeEntrega> {

    @Override
    public PrioridadeEntrega convert(String source) {
        return PrioridadeEntrega.from(source);
    }
}