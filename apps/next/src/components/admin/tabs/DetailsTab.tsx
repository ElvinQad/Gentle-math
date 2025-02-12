import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface DetailsTabProps {
  formData: {
    title: string;
    description: string;
    type: string;
  };
  setFormData: (data: Partial<{ title: string; description: string; type: string; imageUrls: string[]; mainImageIndex: number; spreadsheetUrl: string; }>) => void;
}

export function DetailsTab({ formData, setFormData }: DetailsTabProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label 
          htmlFor="title" 
          className="text-sm font-medium text-[color:var(--muted-foreground)]"
        >
          Title
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ title: e.target.value })}
          placeholder="Enter trend title"
          required
          className="w-full px-4 py-2 bg-[color:var(--background)] border border-[color:var(--border)] rounded-lg
            focus:ring-2 focus:ring-[color:var(--primary)]/20 focus:border-[color:var(--primary)]
            placeholder:text-[color:var(--muted-foreground)]/50"
        />
      </div>

      <div className="space-y-2">
        <Label 
          htmlFor="description"
          className="text-sm font-medium text-[color:var(--muted-foreground)]"
        >
          Description
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ description: e.target.value })}
          placeholder="Enter trend description"
          required
          rows={4}
          className="w-full px-4 py-2 bg-[color:var(--background)] border border-[color:var(--border)] rounded-lg
            focus:ring-2 focus:ring-[color:var(--primary)]/20 focus:border-[color:var(--primary)]
            placeholder:text-[color:var(--muted-foreground)]/50 resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label 
          htmlFor="type"
          className="text-sm font-medium text-[color:var(--muted-foreground)]"
        >
          Type
        </Label>
        <select
          id="type"
          value={formData.type}
          onChange={(e) => setFormData({ type: e.target.value })}
          className="w-full px-4 py-2 bg-[color:var(--background)] border border-[color:var(--border)] rounded-lg
            focus:ring-2 focus:ring-[color:var(--primary)]/20 focus:border-[color:var(--primary)]
            text-[color:var(--foreground)]"
          required
        >
          <option value="">Select type</option>
          <option value="Fashion">Fashion</option>
          <option value="Technology">Technology</option>
          <option value="Lifestyle">Lifestyle</option>
          <option value="Business">Business</option>
        </select>
      </div>
    </div>
  );
} 