"use client";

import React, { memo } from "react";
import { CheckIcon, Globe, PlusIcon } from "lucide-react";
import { FileUIPart } from "ai";
import {
  Attachment,
  AttachmentPreview,
  AttachmentRemove,
  Attachments,
} from "@/components/ai-elements/attachments";
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorLogoGroup,
  ModelSelectorName,
  ModelSelectorTrigger,
} from "@/components/ai-elements/model-selector";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionAddScreenshot,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputAttachments,
} from "@/components/ai-elements/prompt-input";

export const mistralModels = [
  { chefSlug: "mistral", id: "mistral-large-latest", name: "Mistral Large", providers: ["mistral"] },
  { chefSlug: "mistral", id: "mistral-small-latest", name: "Mistral Small", providers: ["mistral"] },
  { chefSlug: "mistral", id: "codestral-latest", name: "Codestral", providers: ["mistral"] },
  { chefSlug: "deepseek", id: "deepseek-reasoner", name: "DeepSeek R1", providers: ["deepseek"] },
] as const;

export type ModelItemData = (typeof mistralModels)[number];

const AttachmentItem = memo(
  ({ attachment, onRemove }: { attachment: FileUIPart & { id: string }; onRemove: (id: string) => void }) => (
    <Attachment data={attachment} onRemove={() => onRemove(attachment.id)}>
      <AttachmentPreview />
      <AttachmentRemove />
    </Attachment>
  )
);
AttachmentItem.displayName = "AttachmentItem";

const ModelItem = memo(
  ({ m, selectedModel, onSelect }: { m: ModelItemData; selectedModel: string; onSelect: (id: string) => void }) => (
    <ModelSelectorItem 
      onSelect={() => onSelect(m.id)} 
      value={m.id}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors data-[selected=true]:bg-white/5"
    >
      <div className="flex items-center justify-center size-6 rounded-lg bg-white/5 border border-white/10">
        <ModelSelectorLogo provider={m.chefSlug} className="size-3.5 opacity-80" />
      </div>
      
      <div className="flex-1 flex flex-col">
        <ModelSelectorName className="text-sm font-medium text-white/90">
          {m.name}
        </ModelSelectorName>
      </div>

      {selectedModel === m.id && (
        <CheckIcon className="size-4 text-primary" />
      )}
    </ModelSelectorItem>
  )
);
ModelItem.displayName = "ModelItem";

const PromptInputAttachmentsDisplay = () => {
  const attachments = usePromptInputAttachments();
  if (attachments.files.length === 0) return null;
  return (
    <Attachments variant="inline" className="border-b border-white/5 bg-white/[0.02] px-6 py-3">
      {attachments.files.map((attachment) => (
        <AttachmentItem attachment={attachment} key={attachment.id} onRemove={attachments.remove} />
      ))}
    </Attachments>
  );
};

interface ChatInputProps {
  input: string;
  setInput: (v: string) => void;
  isLoading: boolean;
  sendMessage: (message: { text: string; files: FileUIPart[] }, options?: any) => Promise<void>;
  selectedModel: string;
  setSelectedModel: (id: string) => void;
  selectedModelData: ModelItemData | undefined;
  modelSelectorOpen: boolean;
  setModelSelectorOpen: (open: boolean) => void;
}

export function ChatInput({
  input,
  setInput,
  isLoading,
  sendMessage,
  selectedModel,
  setSelectedModel,
  selectedModelData,
  modelSelectorOpen,
  setModelSelectorOpen,
}: ChatInputProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 px-3 pb-6 md:px-6 md:pb-8 z-20">
      <div className="mx-auto w-full max-w-3xl">
        <PromptInput
          className="pointer-events-auto bg-[#131313] rounded-xl border border-white/10 shadow-2xl transition-all duration-300 overflow-hidden"
          onSubmit={async (message) => {
            if (!message.text.trim() && message.files.length === 0) return;
            await sendMessage(
              {
                text: message.text,
                files: message.files,
              },
              { body: { model: selectedModel } }
            );
            setInput("");
          }}
        >
          <PromptInputAttachmentsDisplay />
          <PromptInputBody>
            <PromptInputTextarea
              className="w-full bg-transparent border-none focus:ring-0 outline-none resize-none pt-5 pb-3 px-6 max-h-56 min-h-[60px] text-[15px] font-normal tracking-tight placeholder:text-white/30 scrollbar-hide text-white"
              onChange={(event) => setInput(event.currentTarget.value)}
              placeholder="What would you like to know?"
              value={input}
            />
          </PromptInputBody>
          <PromptInputFooter className="px-5 pb-4 pt-0 flex items-center justify-between">
            <PromptInputTools className="gap-2">
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger className="p-0 bg-transparent rounded-full size-8 flex items-center justify-center border-none text-white/60 hover:text-white transition-colors cursor-pointer">
                  <PlusIcon className="size-4" />
                </PromptInputActionMenuTrigger>
                <PromptInputActionMenuContent className="rounded-2xl shadow-3xl bg-[#131313] border border-white/10 p-1">
                  <PromptInputActionAddAttachments className="rounded-lg hover:bg-white/5" />
                  <PromptInputActionAddScreenshot className="rounded-lg hover:bg-white/5" />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>
              
              <PromptInputButton className="flex items-center justify-center gap-2 rounded-full p-2 pr-2.5 bg-transparent border-none text-white/60 hover:text-white transition-colors cursor-pointer">
                <Globe size={15} />
                <span className="text-sm font-medium">Search</span>
              </PromptInputButton>

              <ModelSelector onOpenChange={setModelSelectorOpen} open={modelSelectorOpen}>
                <ModelSelectorTrigger asChild>
                  <PromptInputButton className="flex items-center justify-center gap-2 rounded-full p-2 pr-2.5 bg-transparent border-none text-white/60 hover:text-white transition-colors cursor-pointer">
                    {selectedModelData?.chefSlug && <ModelSelectorLogo className="size-3.5 opacity-60" provider={selectedModelData.chefSlug} />}
                    <span className="text-sm font-medium">{selectedModelData?.name}</span>
                  </PromptInputButton>
                </ModelSelectorTrigger>
                <ModelSelectorContent className="rounded-2xl shadow-3xl bg-[#0f0f0f] border border-white/10 min-w-[300px] p-2 overflow-hidden">
                  <div className="px-2 pt-2 pb-1">
                    <ModelSelectorInput 
                      className="bg-white/5 border border-white/5 rounded-xl h-10 px-3 text-sm focus-within:border-white/10 transition-all" 
                      placeholder="Search models..." 
                    />
                  </div>
                  <ModelSelectorList className="p-1 max-h-[400px] overflow-y-auto scrollbar-hide">
                    <ModelSelectorEmpty className="text-xs text-white/20 py-8 text-center">No models found.</ModelSelectorEmpty>
                    <ModelSelectorGroup heading="Available Models" className="px-2 py-3">
                      <div className="space-y-1 mt-2">
                        {mistralModels.map((model) => (
                          <ModelItem key={model.id} m={model} onSelect={(id) => setSelectedModel(id)} selectedModel={selectedModel} />
                        ))}
                      </div>
                    </ModelSelectorGroup>
                  </ModelSelectorList>
                </ModelSelectorContent>
              </ModelSelector>
            </PromptInputTools>
            <PromptInputSubmit
              className={`transition-all duration-200 rounded-lg size-8 flex items-center justify-center ${
                input.trim() || isLoading 
                  ? "bg-[#007AFF] text-white shadow-lg shadow-blue-500/20" 
                  : "bg-white/5 text-white/20"
              }`}
              status={isLoading ? "submitted" : undefined}
            />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
