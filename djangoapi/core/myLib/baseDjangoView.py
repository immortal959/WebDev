from django.http import JsonResponse
from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin

class BaseDjangoView(LoginRequiredMixin, View):
    raise_exception = True

    def get(self, request, *args, **kwargs):
        action = kwargs.get('action')
        if action == 'selectone':
            id = kwargs.get('id')
            return self.selectone(id)
        elif action == 'selectall':
            return self.selectall()
        else:
            return JsonResponse({"message": "Invalid operation option"}, status=400)

    def post(self, request, *args, **kwargs):
        action = kwargs.get('action')
        # Read-only actions allowed for all authenticated users
        if action in ['selectone', 'selectall']:
            return self.get(request, *args, **kwargs)
        # Write actions only for editors
        user_groups = list(request.user.groups.values_list('name', flat=True))
        is_editor = 'editor' in user_groups or request.user.is_superuser
        if not is_editor:
            return JsonResponse({"ok": False, "message": "You don't have permission to perform this action. Editor group required.", "data": []}, status=403)
        if action == 'insert':
            return self.insert(request)
        elif action == 'update':
            id = kwargs.get('id')
            return self.update(request, id)
        elif action == 'delete':
            id = kwargs.get('id')
            return self.delete(id)
        else:
            return JsonResponse({"message": "Invalid operation option"}, status=400)

    def selectone(self, id):
        return JsonResponse({'ok':True, 'message': 'Method selectone called: GET', 'data': []}, status=200)

    def selectall(self):
        return JsonResponse({'ok':True, 'message': 'Method selectall called: GET', 'data': []}, status=200)

    def insert(self, request):
        return JsonResponse({'ok':True, 'message': 'Method insert called: POST', 'data': []}, status=200)

    def update(self, request, id):
        return JsonResponse({'ok':True, 'message': 'Method update called: POST', 'data': []}, status=200)

    def delete(self, id):
        return JsonResponse({'ok':True, 'message': 'Method delete called: POST', 'data': []}, status=200)