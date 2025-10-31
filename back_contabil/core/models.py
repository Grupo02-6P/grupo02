from django.db import models
from accounts.models import CustomUser


# =========================
#  Empresa
# =========================
class Empresa(models.Model):
    nome = models.CharField(max_length=255)
    cnpj = models.CharField(max_length=20, unique=True)
    ativa = models.BooleanField(default=True)

    def __str__(self):
        return self.nome


# =========================
#  Usuários & Permissões
# =========================
class GrupoPermissao(models.Model):
    nome = models.CharField(max_length=100)

    def __str__(self):
        return self.nome


# =========================
#  Plano de Contas
# =========================
class PlanoContas(models.Model):
    empresa = models.ForeignKey(
        Empresa, on_delete=models.CASCADE, related_name="planos"
    )
    nome = models.CharField(max_length=150)
    ativo = models.BooleanField(default=True)

    class Meta:
        unique_together = ("empresa", "nome")

    def __str__(self):
        return f"{self.nome} - {self.empresa.nome}"


class ContaContabil(models.Model):
    plano = models.ForeignKey(
        PlanoContas, on_delete=models.CASCADE, related_name="contas"
    )
    codigo = models.CharField(max_length=50)
    descricao = models.CharField(max_length=255)
    aceita_lancamento = models.BooleanField(default=True)
    ativa = models.BooleanField(default=True)
    parent = models.ForeignKey(
        "self", on_delete=models.SET_NULL, null=True, blank=True, related_name="filhas"
    )

    class Meta:
        unique_together = ("plano", "codigo")

    def __str__(self):
        return f"{self.codigo} - {self.descricao}"


# =========================
#  Clientes / Fornecedores
# =========================
class ClienteFornecedor(models.Model):
    empresa = models.ForeignKey(
        Empresa, on_delete=models.CASCADE, related_name="clientes_fornecedores"
    )
    nome = models.CharField(max_length=255)
    documento = models.CharField(max_length=20)
    ativo = models.BooleanField(default=True)

    class Meta:
        unique_together = ("empresa", "documento")

    def __str__(self):
        return f"{self.nome} ({self.documento})"


# =========================
#  Tipos de Lançamento
# =========================
class TipoLancamento(models.Model):
    empresa = models.ForeignKey(
        Empresa, on_delete=models.CASCADE, related_name="tipos_lancamento"
    )
    nome = models.CharField(max_length=150)
    conta_baixa = models.ForeignKey(
        ContaContabil, on_delete=models.PROTECT, related_name="tipos_baixa"
    )
    ativo = models.BooleanField(default=True)

    class Meta:
        unique_together = ("empresa", "nome")

    def __str__(self):
        return self.nome


# =========================
#  Tipos de Movimentação
# =========================
class TipoMovimentacao(models.Model):
    empresa = models.ForeignKey(
        Empresa, on_delete=models.CASCADE, related_name="tipos_movimentacao"
    )
    nome = models.CharField(max_length=150)
    conta_debito = models.ForeignKey(
        ContaContabil, on_delete=models.PROTECT, related_name="tipos_debito"
    )
    conta_credito = models.ForeignKey(
        ContaContabil, on_delete=models.PROTECT, related_name="tipos_credito"
    )
    ativo = models.BooleanField(default=True)

    class Meta:
        unique_together = ("empresa", "nome")

    def __str__(self):
        return self.nome


# =========================
#  Lançamentos Financeiros
# =========================
class LancamentoFinanceiro(models.Model):
    class Status(models.TextChoices):
        PROVISAO = "provisao", "Provisão"
        BAIXADO = "baixado", "Baixado"
        ESTORNADO = "estornado", "Estornado"

    empresa = models.ForeignKey(
        Empresa, on_delete=models.CASCADE, related_name="lancamentos_financeiros"
    )
    tipo_lancamento = models.ForeignKey(TipoLancamento, on_delete=models.PROTECT)
    tipo_movimentacao = models.ForeignKey(TipoMovimentacao, on_delete=models.PROTECT)
    cliente_fornecedor = models.ForeignKey(ClienteFornecedor, on_delete=models.PROTECT)
    valor = models.DecimalField(max_digits=15, decimal_places=2)
    data_emissao = models.DateField()
    data_vencimento = models.DateField(null=True, blank=True)
    data_baixa = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PROVISAO
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Lançamento {self.id} - {self.valor}"


# =========================
#  Lançamentos Contábeis
# =========================
class LancamentoContabil(models.Model):
    class Tipo(models.TextChoices):
        DEBITO = "debito", "Débito"
        CREDITO = "credito", "Crédito"

    lancamento_financeiro = models.ForeignKey(
        LancamentoFinanceiro,
        on_delete=models.CASCADE,
        related_name="lancamentos_contabeis",
    )
    conta = models.ForeignKey(ContaContabil, on_delete=models.PROTECT)
    tipo = models.CharField(max_length=7, choices=Tipo.choices)
    valor = models.DecimalField(max_digits=15, decimal_places=2)
    data = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)


# =========================
#  Auditoria
# =========================
class Auditoria(models.Model):
    empresa = models.ForeignKey(
        Empresa, on_delete=models.CASCADE, related_name="auditorias"
    )
    usuario = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True)
    entidade = models.CharField(max_length=100)
    operacao = models.CharField(max_length=20)
    registro_id = models.IntegerField()
    data = models.DateTimeField(auto_now_add=True)
    detalhes = models.JSONField(null=True, blank=True)
