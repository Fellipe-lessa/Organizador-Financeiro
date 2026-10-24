package com.financas.backend.transacao;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransacaoRepository extends JpaRepository<Transacao, Long> {
    List<Transacao> findByDataBetweenOrderByDataDescIdDesc(LocalDate inicio, LocalDate fim);
    boolean existsByCategoriaId(Long categoriaId);
}
