import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Loan, insertLoanSchema } from "@shared/schema";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeftCircle, 
  Loader2, 
  Plus, 
  Pencil, 
  Trash2, 
  Bell 
} from "lucide-react";
import { Link } from "wouter";
import { sendPushNotification } from "@/lib/onesignal";

const loanFormSchema = insertLoanSchema.extend({
  logo: z.instanceof(FileList).optional(),
  logoUrl: z.string().optional(),
});

type LoanFormValues = z.infer<typeof loanFormSchema>;

export default function AdminPage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  
  const { data: loans, isLoading } = useQuery<Loan[]>({
    queryKey: ["/api/loans"],
  });
  
  const form = useForm<LoanFormValues>({
    resolver: zodResolver(loanFormSchema),
    defaultValues: {
      name: "",
      amount: 30000,
      term_from: 5,
      term_to: 30,
      rate: 0,
      is_first_loan_zero: false,
      link: "",
      priority: 10,
      approval_rate: 90,
    },
  });
  
  const notificationForm = useForm({
    defaultValues: {
      title: "",
      message: "",
      url: "",
    },
  });
  
  const addLoanMutation = useMutation({
    mutationFn: async (data: LoanFormValues) => {
      const formData = new FormData();
      
      // Append all form fields to FormData
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'logo' && data.logo instanceof FileList && data.logo.length > 0) {
          formData.append('logo', data.logo[0]);
        } else if (key !== 'logo' && key !== 'logoUrl' && value !== undefined) {
          formData.append(key, String(value));
        }
      });
      
      const response = await fetch('/api/loans', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to add loan');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loans"] });
      setIsAddDialogOpen(false);
      form.reset();
      toast({
        title: "Успешно!",
        description: "Предложение добавлено",
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const updateLoanMutation = useMutation({
    mutationFn: async (data: LoanFormValues & { id: number }) => {
      const { id, ...loanData } = data;
      const formData = new FormData();
      
      // Append all form fields to FormData
      Object.entries(loanData).forEach(([key, value]) => {
        if (key === 'logo' && data.logo instanceof FileList && data.logo.length > 0) {
          formData.append('logo', data.logo[0]);
        } else if (key !== 'logo' && key !== 'logoUrl' && value !== undefined) {
          formData.append(key, String(value));
        }
      });
      
      const response = await fetch(`/api/loans/${id}`, {
        method: 'PUT',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to update loan');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loans"] });
      setIsEditDialogOpen(false);
      setSelectedLoan(null);
      toast({
        title: "Успешно!",
        description: "Предложение обновлено",
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const deleteLoanMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/loans/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loans"] });
      toast({
        title: "Успешно!",
        description: "Предложение удалено",
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const sendNotificationMutation = useMutation({
    mutationFn: async (data: { title: string; message: string; url?: string }) => {
      return await sendPushNotification(data.title, data.message, data.url);
    },
    onSuccess: () => {
      setIsNotificationDialogOpen(false);
      notificationForm.reset();
      toast({
        title: "Успешно!",
        description: "Уведомление отправлено",
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка отправки уведомления",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onAddSubmit = (data: LoanFormValues) => {
    addLoanMutation.mutate(data);
  };
  
  const onEditSubmit = (data: LoanFormValues) => {
    if (selectedLoan) {
      updateLoanMutation.mutate({ ...data, id: selectedLoan.id });
    }
  };
  
  const onNotificationSubmit = (data: { title: string; message: string; url: string }) => {
    sendNotificationMutation.mutate(data);
  };
  
  const handleEditLoan = (loan: Loan) => {
    setSelectedLoan(loan);
    form.reset({
      name: loan.name,
      amount: loan.amount,
      term_from: loan.term_from,
      term_to: loan.term_to,
      rate: Number(loan.rate),
      is_first_loan_zero: loan.is_first_loan_zero,
      link: loan.link,
      priority: loan.priority,
      approval_rate: loan.approval_rate,
      logoUrl: loan.logo,
    });
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteLoan = (id: number) => {
    deleteLoanMutation.mutate(id);
  };
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Link href="/">
              <Button variant="outline" size="sm" className="mr-2">
                <ArrowLeftCircle className="mr-2 h-4 w-4" />
                Вернуться на сайт
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Админ-панель</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsNotificationDialogOpen(true)}>
              <Bell className="mr-2 h-4 w-4" />
              Отправить уведомление
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Выйти"
              )}
            </Button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Предложения МФО</h2>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Добавить
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Добавить новое предложение</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onAddSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Название МФО</FormLabel>
                          <FormControl>
                            <Input placeholder="Займер" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="logo"
                      render={({ field: { value, onChange, ...field } }) => (
                        <FormItem>
                          <FormLabel>Логотип</FormLabel>
                          <FormControl>
                            <Input
                              type="file"
                              accept="image/*,.svg"
                              {...field}
                              onChange={(e) => onChange(e.target.files)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Макс. сумма займа</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="rate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ставка (%)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="term_from"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Мин. срок (дни)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="term_to"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Макс. срок (дни)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Приоритет (меньше = выше)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="approval_rate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>% одобрения</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="link"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Партнерская ссылка</FormLabel>
                          <FormControl>
                            <Input placeholder="https://..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="is_first_loan_zero"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Первый займ под 0%</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit" disabled={addLoanMutation.isPending}>
                        {addLoanMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Сохранение...
                          </>
                        ) : (
                          "Сохранить"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : loans && loans.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Имя</TableHead>
                    <TableHead>Лого</TableHead>
                    <TableHead>Сумма</TableHead>
                    <TableHead>Срок</TableHead>
                    <TableHead>Ставка</TableHead>
                    <TableHead>0%</TableHead>
                    <TableHead>Приоритет</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loans.map((loan) => (
                    <TableRow key={loan.id}>
                      <TableCell>{loan.id}</TableCell>
                      <TableCell>{loan.name}</TableCell>
                      <TableCell>
                        <img src={loan.logo} alt={loan.name} className="w-10 h-10 rounded object-cover" />
                      </TableCell>
                      <TableCell>{loan.amount} ₽</TableCell>
                      <TableCell>{loan.term_from}-{loan.term_to} дн.</TableCell>
                      <TableCell>{Number(loan.rate)}%</TableCell>
                      <TableCell>{loan.is_first_loan_zero ? "Да" : "Нет"}</TableCell>
                      <TableCell>{loan.priority}</TableCell>
                      <TableCell className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEditLoan(loan)}
                          title="Редактировать"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" title="Удалить">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Это действие нельзя отменить. Предложение МФО "{loan.name}" будет удалено.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Отмена</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteLoan(loan.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Удалить
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              Нет предложений МФО. Добавьте первое.
            </div>
          )}
        </div>
      </div>
      
      {/* Edit Loan Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактировать предложение</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название МФО</FormLabel>
                    <FormControl>
                      <Input placeholder="Займер" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="logo"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Логотип</FormLabel>
                    {form.getValues("logoUrl") && (
                      <div className="mb-2">
                        <img src={form.getValues("logoUrl")} alt="Current logo" className="h-12 w-12 rounded object-cover" />
                      </div>
                    )}
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*,.svg"
                        {...field}
                        onChange={(e) => onChange(e.target.files)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Макс. сумма займа</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ставка (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="term_from"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Мин. срок (дни)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="term_to"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Макс. срок (дни)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Приоритет (меньше = выше)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="approval_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>% одобрения</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Партнерская ссылка</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="is_first_loan_zero"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Первый займ под 0%</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={updateLoanMutation.isPending}>
                  {updateLoanMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Сохранение...
                    </>
                  ) : (
                    "Сохранить"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Push Notification Dialog */}
      <Dialog open={isNotificationDialogOpen} onOpenChange={setIsNotificationDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Отправить Push-уведомление</DialogTitle>
            <DialogDescription>
              Уведомление будет отправлено всем пользователям, которые разрешили уведомления.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Заголовок</label>
              <Input
                {...notificationForm.register("title", { required: true })}
                placeholder="Новое предложение займа"
              />
              {notificationForm.formState.errors.title && (
                <p className="text-red-500 text-xs">Требуется заголовок</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Сообщение</label>
              <Input
                {...notificationForm.register("message", { required: true })}
                placeholder="Получите займ до 30 000 ₽ под 0% сегодня!"
              />
              {notificationForm.formState.errors.message && (
                <p className="text-red-500 text-xs">Требуется сообщение</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">URL (необязательно)</label>
              <Input
                {...notificationForm.register("url")}
                placeholder="https://..."
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={sendNotificationMutation.isPending}>
                {sendNotificationMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Отправка...
                  </>
                ) : (
                  "Отправить"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
