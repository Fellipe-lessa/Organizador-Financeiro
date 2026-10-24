package com.financas.backend.orcamento;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrcamentoRepository extends JpaRepository<Orcamento, Long> {
    List<Orcamento> findByMes(LocalDate mes);
    Optional<Orcamento> findByCategoriaIdAndMes(Long categoriaId, LocalDate mes);
    boolean existsByCategoriaId(Long categoriaId);
}