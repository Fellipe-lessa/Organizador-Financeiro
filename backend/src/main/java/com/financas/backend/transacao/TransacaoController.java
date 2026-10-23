package com.financas.backend.transacao;

import com.financas.backend.categoria.Categoria;
import com.financas.backend.categoria.CategoriaRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/transacoes")
public class TransacaoController {
    private final TransacaoRepository repo;
    private final CategoriaRepository categorias;

    public TransacaoController(TransacaoRepository repo, CategoriaRepository categorias) {
        this.repo = repo;
        this.categorias = categorias;
    }

    public record TransacaoRequest(
            @NotBlank @Pattern(regexp = "[DR]") String tipo,
            @NotNull LocalDate data,
            @NotNull Long categoriaId,
            @NotBlank @Size(max = 30) String formaPagamento,
            @Positive long valorCentavos,
            @Size(max = 80) String observacao) {}

    public record TransacaoResponse(Long id, String tipo, LocalDate data, Long categoriaId,
                                    String categoria, String formaPagamento, long valorCentavos, String observacao) {}

    @GetMapping
    public List<TransacaoResponse> listar(@RequestParam(required = false) String mes) {
        List<Transacao> lista;
        if (mes == null) {
            lista = repo.findAll(Sort.by(Sort.Direction.DESC, "data", "id"));
        } else {
            try {
                YearMonth ym = YearMonth.parse(mes);
                lista = repo.findByDataBetweenOrderByDataDescIdDesc(ym.atDay(1), ym.atEndOfMonth());
            } catch (DateTimeParseException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Use o formato AAAA-MM, por exemplo 2026-10");
            }
        }
        return lista.stream().map(this::paraResposta).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TransacaoResponse criar(@Valid @RequestBody TransacaoRequest r) {
        return paraResposta(repo.save(preencher(new Transacao(), r)));
    }

    @PutMapping("/{id}")
    public TransacaoResponse editar(@PathVariable Long id, @Valid @RequestBody TransacaoRequest r) {
        Transacao t = repo.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transação não encontrada"));
        return paraResposta(repo.save(preencher(t, r)));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id) {
        if (!repo.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Transação não encontrada");
        }
        repo.deleteById(id);
    }

    private Transacao preencher(Transacao t, TransacaoRequest r) {
        Categoria c = categorias.findById(r.categoriaId()).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Categoria inexistente"));
        t.setTipo(r.tipo());
        t.setData(r.data());
        t.setCategoria(c);
        t.setFormaPagamento(r.formaPagamento());
        t.setValorCentavos(r.valorCentavos());
        t.setObservacao(r.observacao());
        return t;
    }

    private TransacaoResponse paraResposta(Transacao t) {
        return new TransacaoResponse(t.getId(), t.getTipo(), t.getData(), t.getCategoria().getId(),
                t.getCategoria().getNome(), t.getFormaPagamento(), t.getValorCentavos(), t.getObservacao());
    }
}