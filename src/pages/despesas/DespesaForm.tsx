import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FileText, ImageIcon, UploadCloud, X } from 'lucide-react';
import type { Expense, ExpenseStatus } from '../../services/despesasService';
import {
  COMPROVANTE_MAX_SIZE,
  formatMonthValue,
  isAllowedComprovanteType,
} from '../../services/despesasService';

export interface ExpenseFormValues {
  date: string;
  reference_month: string;
  category: string;
  description: string;
  amount: number;
  cost_center?: string | null;
  status: ExpenseStatus;
}

interface DespesaFormProps {
  initialData?: Expense | null;
  existingComprovanteUrl?: string | null;
  onSubmit: (values: ExpenseFormValues, comprovante?: File | null, removeExisting?: boolean) => Promise<void>;
  onCancel: () => void;
  submitting?: boolean;
}

export function DespesaForm({
  initialData,
  existingComprovanteUrl,
  onSubmit,
  onCancel,
  submitting = false,
}: DespesaFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ExpenseFormValues>({
    defaultValues: {
      date: initialData?.date ?? '',
      reference_month: formatMonthValue(initialData?.reference_month) ?? '',
      category: initialData?.category ?? '',
      description: initialData?.description ?? '',
      amount: initialData?.amount ?? 0,
      cost_center: initialData?.cost_center ?? '',
      status: initialData?.status ?? 'PENDENTE',
    },
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [removeExisting, setRemoveExisting] = useState(false);
  const initialIsImage = useMemo(
    () => (initialData?.comprovante_url ? /\.(png|jpe?g|gif|webp|bmp)$/i.test(initialData.comprovante_url) : false),
    [initialData?.comprovante_url],
  );
  const [imagePreview, setImagePreview] = useState<string | null>(initialIsImage ? existingComprovanteUrl ?? null : null);

  useEffect(() => {
    reset({
      date: initialData?.date ?? '',
      reference_month: formatMonthValue(initialData?.reference_month) ?? '',
      category: initialData?.category ?? '',
      description: initialData?.description ?? '',
      amount: initialData?.amount ?? 0,
      cost_center: initialData?.cost_center ?? '',
      status: initialData?.status ?? 'PENDENTE',
    });
    setSelectedFile(null);
    setFileError(null);
    setRemoveExisting(false);
    setImagePreview(initialIsImage ? existingComprovanteUrl ?? null : null);
  }, [initialData, existingComprovanteUrl, initialIsImage, reset]);

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const comprovanteLabel = useMemo(() => {
    if (selectedFile) return selectedFile.name;
    if (initialData?.comprovante_url && !removeExisting) return 'Comprovante atual disponível';
    return 'Arraste e solte o arquivo aqui ou clique para selecionar';
  }, [initialData?.comprovante_url, removeExisting, selectedFile]);

  const handleFileSelect = (file: File) => {
    setFileError(null);
    if (!isAllowedComprovanteType(file)) {
      setFileError('Envie apenas imagens ou PDFs.');
      return;
    }
    if (file.size > COMPROVANTE_MAX_SIZE) {
      setFileError('Arquivo excede o limite de 10MB.');
      return;
    }

    setSelectedFile(file);
    setRemoveExisting(false);
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    } else {
      setImagePreview(null);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleRemoveFile = () => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setSelectedFile(null);
    setImagePreview(null);
    setRemoveExisting(true);
    setFileError(null);
  };

  const onSubmitForm = handleSubmit(async (values) => {
    await onSubmit(values, selectedFile, removeExisting);
  });

  const isPdf =
    selectedFile?.type === 'application/pdf' ||
    (!selectedFile && initialData?.comprovante_url && !removeExisting && !initialIsImage);

  return (
    <form onSubmit={onSubmitForm} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm font-medium text-gray-700">
          Data
          <input
            type="date"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
            {...register('date', { required: 'Informe a data da despesa' })}
          />
          {errors.date && <span className="text-xs text-red-600">{errors.date.message}</span>}
        </label>

        <label className="space-y-1 text-sm font-medium text-gray-700">
          Mês de Referência
          <input
            type="month"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
            {...register('reference_month', { required: 'Informe o mês de referência' })}
          />
          {errors.reference_month && (
            <span className="text-xs text-red-600">{errors.reference_month.message}</span>
          )}
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm font-medium text-gray-700">
          Categoria
          <input
            type="text"
            placeholder="Transporte, Alimentação..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
            {...register('category', { required: 'Informe a categoria' })}
          />
          {errors.category && <span className="text-xs text-red-600">{errors.category.message}</span>}
        </label>

        <label className="space-y-1 text-sm font-medium text-gray-700">
          Centro de Custo
          <input
            type="text"
            placeholder="Opcional"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
            {...register('cost_center')}
          />
        </label>
      </div>

      <label className="space-y-1 text-sm font-medium text-gray-700">
        Descrição
        <textarea
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          placeholder="Detalhe o gasto realizado"
          {...register('description', { required: 'Informe a descrição' })}
        />
        {errors.description && <span className="text-xs text-red-600">{errors.description.message}</span>}
      </label>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm font-medium text-gray-700">
          Valor
          <input
            type="number"
            step="0.01"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
            {...register('amount', {
              required: 'Informe o valor',
              valueAsNumber: true,
              min: { value: 0.01, message: 'Valor deve ser maior que zero' },
            })}
          />
          {errors.amount && <span className="text-xs text-red-600">{errors.amount.message}</span>}
        </label>

        <label className="space-y-1 text-sm font-medium text-gray-700">
          Status
          <select
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
            {...register('status', { required: 'Informe o status' })}
          >
            <option value="PENDENTE">Pendente</option>
            <option value="APROVADO">Aprovado</option>
            <option value="REJEITADO">Rejeitado</option>
            <option value="PAGO">Pago</option>
          </select>
        </label>
      </div>

      <div className="space-y-2">
        <span className="text-sm font-medium text-gray-700">Comprovante</span>
        <label
          className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center hover:border-primary"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
          <UploadCloud className="mb-2 text-gray-500" size={24} />
          <p className="text-sm text-gray-700">{comprovanteLabel}</p>
          <p className="text-xs text-gray-500">Formatos aceitos: imagens ou PDF (até 10MB)</p>
        </label>
        {fileError && <p className="text-xs text-red-600">{fileError}</p>}

        {(selectedFile || (!!initialData?.comprovante_url && !removeExisting && existingComprovanteUrl)) && (
          <div className="flex items-center justify-between rounded-md border border-gray-200 bg-white p-3">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              {imagePreview ? <ImageIcon size={16} /> : <FileText size={16} />}
              <span>{selectedFile?.name ?? 'Comprovante enviado'}</span>
              {imagePreview && (
                <a
                  href={imagePreview}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline"
                >
                  Visualizar
                </a>
              )}
              {isPdf && existingComprovanteUrl && !selectedFile && (
                <a
                  href={existingComprovanteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline"
                >
                  Abrir PDF
                </a>
              )}
            </div>
            <button
              type="button"
              onClick={handleRemoveFile}
              className="inline-flex items-center rounded-md border border-gray-200 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50"
            >
              <X size={14} className="mr-1" /> Remover
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="button bg-white text-gray-700 hover:bg-gray-100"
          disabled={submitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="button button-primary"
          disabled={submitting}
        >
          {submitting ? 'Salvando...' : 'Salvar despesa'}
        </button>
      </div>
    </form>
  );
}
