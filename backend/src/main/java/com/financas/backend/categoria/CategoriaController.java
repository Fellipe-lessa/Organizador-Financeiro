package com.financas.backend.categoria;

import com.financas.backend.orcamento.OrcamentoRepository;
import com.financas.backend.transacao.TransacaoRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.Set;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {
    private static final Set<String> PADRAO = Set.of("Renda", "Outros");

    private final CategoriaRepository repo;
    private final TransacaoRepository transacoes;
    private final OrcamentoRepository orcamentos;

    public CategoriaController(CategoriaRepository repo, TransacaoRepository transacoes,
                               OrcamentoRepository orcamentos) {
        this.repo = repo;
        this.transacoes = transacoes;
        this.orcamentos = orcamentos;
    }

    public record CategoriaDto(Long id, String nome) {}

    public record CategoriaRequest(@NotBlank @Size(max = 80) String nome) {}

    @GetMapping
    public List<CategoriaDto> listar() {
        return repo.findAll(Sort.by("nome")).stream()
                .map(c -> new CategoriaDto(c.getId(), c.getNome()))
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CategoriaDto criar(@Valid @RequestBody CategoriaRequest r) {
        String nome = r.nome().trim();
        if (repo.existsByNomeIgnoreCase(nome)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Já existe uma categoria com esse nome");
        }
        Categoria c = repo.save(new Categoria(nome));
        return new CategoriaDto(c.getId(), c.getNome());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id) {
        Categoria c = repo.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoria não encontrada"));
        if (PADRAO.contains(c.getNome())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Categoria padrão não pode ser excluída");
        }
        if (transacoes.existsByCategoriaId(id) || orcamentos.existsByCategoriaId(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Categoria em uso por transações ou orçamentos");
        }
        repo.delete(c);
    }
}