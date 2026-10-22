package com.financas.backend.categoria;

import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {
    private final CategoriaRepository repo;

    public CategoriaController(CategoriaRepository repo) { this.repo = repo; }

    public record CategoriaDto(Long id, String nome) {}

    @GetMapping
    public List<CategoriaDto> listar() {
        return repo.findAll(Sort.by("nome")).stream()
                .map(c -> new CategoriaDto(c.getId(), c.getNome()))
                .toList();
    }
}