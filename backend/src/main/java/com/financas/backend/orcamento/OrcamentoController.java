package com.financas.backend.orcamento;

import com.financas.backend.categoria.Categoria;
import com.financas.backend.categoria.CategoriaRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/orcamentos")
public class OrcamentoController {
    private final OrcamentoRepository repo;
    private final CategoriaRepository categorias;

    public OrcamentoController(OrcamentoRepository repo, CategoriaRepository categorias) {
        this.repo = repo;
        this.categorias = categorias;
    }

    public record OrcamentoRequest(
            @NotNull Long categoriaId,
            @NotBlank @Pattern(regexp = "\\d{4}-(0[1-9]|1[0-2])") String mes,
            @PositiveOrZero long limiteCentavos) {}

    public record OrcamentoResponse(Long categoriaId, String categoria, String mes, long limiteCentavos) {}

    @GetMapping
    public List<OrcamentoResponse> listar(@RequestParam String mes) {
        return repo.findByMes(primeiroDia(mes)).stream()
                .map(o -> new OrcamentoResponse(o.getCategoria().getId(), o.getCategoria().getNome(), mes, o.getLimiteCentavos()))
                .toList();
    }

    @PutMapping
    public OrcamentoResponse definir(@Valid @RequestBody OrcamentoRequest r) {
        LocalDate mes = primeiroDia(r.mes());
        Categoria c = categorias.findById(r.categoriaId()).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Categoria inexistente"));
        Optional<Orcamento> atual = repo.findByCategoriaIdAndMes(c.getId(), mes);
        if (r.limiteCentavos() == 0) {
            atual.ifPresent(repo::delete);
            return new OrcamentoResponse(c.getId(), c.getNome(), r.mes(), 0);
        }
        Orcamento o = atual.orElseGet(Orcamento::new);
        o.setCategoria(c);
        o.setMes(mes);
        o.setLimiteCentavos(r.limiteCentavos());
        repo.save(o);
        return new OrcamentoResponse(c.getId(), c.getNome(), r.mes(), r.limiteCentavos());
    }

    private LocalDate primeiroDia(String mes) {
        try {
            return YearMonth.parse(mes).atDay(1);
        } catch (DateTimeParseException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Use o formato AAAA-MM, por exemplo 2026-10");
        }
    }
}