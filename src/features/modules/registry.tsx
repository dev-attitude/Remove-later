import type { ComponentType } from "react";
import type { PortalId } from "@/lib/portals";

import WritingModule from "./writing";
import UnderstandingModule from "./understanding";
import LiteratureModule from "./literature";
import DataAnalysisModule from "./data-analysis";
import TranscriptionModule from "./transcription";
import AIDetectionModule from "./ai-detection";
import PlagiarismModule from "./plagiarism";
import CitationsModule from "./citations";
import ProposalsModule from "./proposals";
import CollaborationModule from "./collaboration";
import TutorModule from "./tutor";
import SurveysModule from "./surveys";
import PresentationsModule from "./presentations";
import RepositoryModule from "./repository";
import JournalModule from "./journal";
import AdminModule from "./admin";
import HowItWorksModule from "./how-it-works";
import MarkingModule from "./marking";
import DeveloperConsoleModule from "./developer-console";

export const MODULE_REGISTRY: Record<string, ComponentType> = {
  writing: WritingModule,
  understanding: UnderstandingModule,
  literature: LiteratureModule,
  "data-analysis": DataAnalysisModule,
  transcription: TranscriptionModule,
  "ai-detection": AIDetectionModule,
  plagiarism: PlagiarismModule,
  citations: CitationsModule,
  proposals: ProposalsModule,
  collaboration: CollaborationModule,
  tutor: TutorModule,
  surveys: SurveysModule,
  presentations: PresentationsModule,
  repository: RepositoryModule,
  journal: JournalModule,
  admin: AdminModule,
  "how-it-works": HowItWorksModule,
  marking: MarkingModule,
  "developer-console": DeveloperConsoleModule,
};

export function getModuleComponent(moduleId: string): ComponentType | undefined {
  return MODULE_REGISTRY[moduleId];
}
