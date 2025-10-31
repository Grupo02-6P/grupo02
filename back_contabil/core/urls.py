# urls.py
from django.urls import path
from .views import Tela1View, Tela2View, Tela3View, SuportView, EmpresaAPIView

urlpatterns = [
    path('telas/tela1/', Tela1View.as_view(), name='tela1'),
    path('telas/tela2/', Tela2View.as_view(), name='tela2'),
    path('telas/tela3/', Tela3View.as_view(), name='tela3'),
    path('telas/suport/', SuportView.as_view(), name='suport'),
    path('empresas/', EmpresaAPIView.as_view(), name='empresa-list-create'),
    path('empresas/<int:pk>/', EmpresaAPIView.as_view(), name='empresa-detail'),
]