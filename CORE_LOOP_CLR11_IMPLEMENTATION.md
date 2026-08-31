# Core Loop Rework — CLR-11 Return Reactions

## Goal
Make a successful hack-and-slash expedition visibly echo in the settlement without introducing another progression authority.

## First vertical slice
`frontier / 開拓辺境`

CLR-10 already records durable Event Memory only after an explicit safe return. CLR-11 projects those existing memories into the existing Settlement Tavern rumor surface:

- Elite defeated + safe return → `強敵を越えた者の話`
- Boss defeated + safe return → `辺境深部からの帰還`
- Boss reaction is presented before the Elite reaction when both exist.

## Authority contract
- Durable source: existing `world2.eventMemory` written by CLR-10.
- Presentation owner: existing Settlement Tavern rumor system.
- CLR-11 owns no save root, currency, reward, quest completion, Story clear, Discovery, or combat modifier.
- Reading a rumor is read-only and cannot unlock mandatory content.
- Elite/Boss victory without explicit safe return does not create the durable memory, therefore does not create a CLR-11 rumor.
- Suspend remains distinct from safe return.

## Core loop
`Battle → Elite/Boss victory → continue expedition → explicit safe return → Event Memory → Tavern rumor`

This makes the world react to what the player accomplished while preserving the principle: **hack-and-slash first; world and story become visible as consequences of play.**
