package com.financas.backend.orcamento;

import com.financas.backend.categoria.Categoria;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "orcamento")
public class Orcamento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

    @Column(nullable = false)
    private LocalDate mes;

    @Column(name = "limite_centavos", nullable = false)
    private long limiteCentavos;

    public Long getId() { return id; }
    public Categoria getCategoria() { return categoria; }
    public void setCategoria(Categoria categoria) { this.categoria = categoria; }
    public LocalDate getMes() { return mes; }
    public void setMes(LocalDate mes) { this.mes = mes; }
    public long getLimiteCentavos() { return limiteCentavos; }
    public void setLimiteCentavos(long limiteCentavos) { this.limiteCentavos = limiteCentavos; }
}