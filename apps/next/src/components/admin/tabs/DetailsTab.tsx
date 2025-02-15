import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TREND_TYPES } from '@/types/trends';

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
          placeholder="Enter a descriptive title for the trend"
          required
          className="flex-1 bg-[color:var(--background)] border border-[color:var(--border)]
            focus:ring-2 focus:ring-[color:var(--primary)]/20 focus:border-[color:var(--primary)]"
        />
        <p className="text-sm text-[color:var(--muted-foreground)]">
          Choose a clear, concise title that describes the trend
        </p>
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
          placeholder="Provide a detailed description of the trend and its significance"
          required
          rows={4}
          className="flex-1 bg-[color:var(--background)] border border-[color:var(--border)]
            focus:ring-2 focus:ring-[color:var(--primary)]/20 focus:border-[color:var(--primary)]
            resize-none min-h-[120px]"
        />
        <p className="text-sm text-[color:var(--muted-foreground)]">
          Include key details about the trend, its impact, and relevance
        </p>
      </div>

      <div className="space-y-2">
        <Label 
          htmlFor="type"
          className="text-sm font-medium text-[color:var(--muted-foreground)]"
        >
          Type
        </Label>
        <Select
          value={formData.type}
          onValueChange={(value: string) => setFormData({ type: value })}
        >
          <SelectTrigger
            id="type"
            className="w-full bg-[color:var(--background)] border border-[color:var(--border)]
              focus:ring-2 focus:ring-[color:var(--primary)]/20 focus:border-[color:var(--primary)]"
          >
            <SelectValue placeholder="Select trend category" />
          </SelectTrigger>
          <SelectContent>
            {TREND_TYPES.map((type) => (
              <SelectItem
                key={type.value}
                value={type.value}
                className="cursor-pointer hover:bg-[color:var(--accent)] hover:text-[color:var(--accent-foreground)]"
              >
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-[color:var(--muted-foreground)]">
          Choose the most relevant category for your trend
        </p>
      </div>
    </div>
  );
} 