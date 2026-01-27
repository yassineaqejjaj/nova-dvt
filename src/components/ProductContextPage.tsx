import { useProductContexts } from '@/components/context/useProductContexts';
import { ContextList } from '@/components/context/ContextList';
import { ContextEditor } from '@/components/context/ContextEditor';
import { ConfirmDeleteDialog } from '@/components/context/ConfirmDeleteDialog';
import { ContextRoleExplainer } from '@/components/context/ContextRoleExplainer';
import { ContextValueBanner } from '@/components/context/ContextValueBanner';

export const ProductContextPage = () => {
  const ctx = useProductContexts();

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl space-y-6">
      {/* Header with role explanation */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Contexte Produit Global</h1>
        <p className="text-muted-foreground">
          Le contexte alimente les agents, les workflows et les décisions générées dans Nova.
        </p>
        <ContextRoleExplainer />
      </div>

      {/* Main content */}
      <div className="flex flex-col gap-6">
        <ContextList
          contexts={ctx.contexts}
          isLoading={ctx.isLoading}
          selectedContextId={ctx.selectedContext?.id}
          searchQuery={ctx.searchQuery}
          onSearch={ctx.setSearchQuery}
          onSelect={ctx.handleSelectContext}
          onNew={ctx.handleNewContext}
          onSetActive={ctx.handleSetActive}
          onDelete={(id) => ctx.setDeleteContextId(id)}
        />

        <ContextEditor
          formData={ctx.formData}
          isSaving={ctx.isSaving}
          isEditing={ctx.isEditing}
          showHistory={ctx.showHistory}
          newObjective={ctx.newObjective}
          newKPI={ctx.newKPI}
          editingObjectiveIndex={ctx.editingObjectiveIndex}
          editingKPIIndex={ctx.editingKPIIndex}
          setFormData={ctx.setFormData}
          setIsEditing={ctx.setIsEditing}
          setShowHistory={ctx.setShowHistory}
          setNewObjective={ctx.setNewObjective}
          setNewKPI={ctx.setNewKPI}
          setEditingObjectiveIndex={ctx.setEditingObjectiveIndex}
          setEditingKPIIndex={ctx.setEditingKPIIndex}
          onSave={() => ctx.handleSave(false)}
          onAddObjective={ctx.handleAddObjective}
          onRemoveObjective={ctx.handleRemoveObjective}
          onAddKPI={ctx.handleAddKPI}
          onRemoveKPI={ctx.handleRemoveKPI}
          updateObjective={ctx.updateObjective}
          updateKPI={ctx.updateKPI}
        />

        {/* Value projection banner */}
        <ContextValueBanner />
      </div>

      <ConfirmDeleteDialog
        open={!!ctx.deleteContextId}
        onOpenChange={(open) => { if (!open) ctx.setDeleteContextId(null); }}
        onConfirm={ctx.handleDeleteContext}
      />
    </div>
  );
};
