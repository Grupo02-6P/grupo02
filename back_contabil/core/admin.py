from django.contrib import admin
from .models import Auditoria, Empresa, TipoLancamento

admin.site.register(Auditoria)
admin.site.register(TipoLancamento)
admin.site.register(Empresa)