import type { SpeakerBase } from "@mtngtools/core";
import { firstNames, lastNames, orgLeadWords, orgTailWords } from "../dictionaries";
import { applyOverrides, idFromParts, indexInto } from "../internal";

export type SpeakerSeed = {
  dayIndex: number;
  blockOrdinal: number;
  sessionOrdinal: number;
  presentationOrdinal: number;
  speakerOrdinal: number;
};

export const createMockSpeakerFromSeed = (
  seed: SpeakerSeed,
  overrides?: Partial<SpeakerBase>,
): SpeakerBase => {
  const { dayIndex, blockOrdinal, sessionOrdinal, presentationOrdinal, speakerOrdinal } = seed;
  const serial =
    dayIndex * 10_000 + blockOrdinal * 1_000 + sessionOrdinal * 100 + presentationOrdinal * 10 + speakerOrdinal;

  const firstName = indexInto(firstNames, undefined, serial);
  const lastName = indexInto(lastNames, undefined, serial * 7 + 13);
  const orgLead = indexInto(orgLeadWords, undefined, serial * 3 + 5);
  const orgTail = indexInto(orgTailWords, undefined, serial * 5 + 11);
  const spId = idFromParts("sp", dayIndex, blockOrdinal, sessionOrdinal, presentationOrdinal, speakerOrdinal);

  return applyOverrides(
    {
      spId,
      spSlug: spId,
      spFullName: `${firstName} ${lastName}`,
      spFirstName: firstName,
      spLastName: lastName,
      spFullOrg: `${orgLead} ${orgTail}`,
      spOrder: speakerOrdinal + 1,
    },
    overrides,
  );
};
