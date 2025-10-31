# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from accounts.permissions import DjangoModelPermissionByTela
from .models import Empresa

class Tela1View(APIView):
    permission_classes = [DjangoModelPermissionByTela]
    screen_name = "tela1"

    def get(self, request):
        return Response({"message": "📺 Bem-vindo à Tela 1!"}, status=status.HTTP_200_OK)


class Tela2View(APIView):
    permission_classes = [DjangoModelPermissionByTela]
    screen_name = "tela2"

    def get(self, request):
        return Response({"message": "📺 Bem-vindo à Tela 2!"}, status=status.HTTP_200_OK)


class Tela3View(APIView):
    permission_classes = [DjangoModelPermissionByTela]
    screen_name = "tela3"

    def get(self, request):
        return Response({"message": "📺 Bem-vindo à Tela 3!"}, status=status.HTTP_200_OK)

class SuportView(APIView):
    permission_classes = [DjangoModelPermissionByTela]
    screen_name = "suport"

    def get(self, request):
        return Response({"message": "📺 Bem-vindo ao suporte"}, status=status.HTTP_200_OK)




class EmpresaAPIView(APIView):
    screen_name = "tela1"

    def get_object(self, pk):
        try:
            return Empresa.objects.get(pk=pk)
        except Empresa.DoesNotExist:
            return False

    def serialize(self, empresa):
        return {
            'id': empresa.id,
            'nome': empresa.nome,
            'cnpj': empresa.cnpj,
            'ativa': empresa.ativa
        }

    def get(self, request, pk=None):
        empresas = Empresa.objects.all()
        return Response([self.serialize(e) for e in empresas])

    def post(self, request):
        data = request.data
        empresa = Empresa.objects.create(
            nome=data.get('nome'),
            cnpj=data.get('cnpj'),
            ativa=data.get('ativa', True)
        )
        return Response(self.serialize(empresa), status=status.HTTP_201_CREATED)

    def put(self, request, pk):
        empresa = self.get_object(pk)
        data = request.data
        empresa.nome = data.get('nome', empresa.nome)
        empresa.cnpj = data.get('cnpj', empresa.cnpj)
        empresa.ativa = data.get('ativa', empresa.ativa)
        empresa.save()
        return Response(self.serialize(empresa))

    def delete(self, request, pk):
        empresa = self.get_object(pk)
        empresa.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)