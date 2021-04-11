// eslint-disable-next-line no-use-before-define
import { MemoryHeaps, Memory, Tag, COMMAND } from './types';

// exported functions

// Global Variables
let ROW: number = 10;
const COLUMN: number = 32;
let MEMORY_SIZE: number = -99;
let TO_SPACE: number;
let FROM_SPACE: number;
let memory: Memory;
// eslint-disable-next-line prefer-const
let memoryHeaps: Memory[] = [];
// eslint-disable-next-line prefer-const
let commandHeap: any[] = [];
// eslint-disable-next-line prefer-const
let operationHeaps: string[] = [];
let toMemoryMatrix: number[][];
let fromMemoryMatrix: number[][];
let tags: Tag[];
let typeTag: string[];
// eslint-disable-next-line prefer-const
let flips: number[] = [];
let TAG_SLOT: number = 0;
let SIZE_SLOT: number = 1;
let FIRST_CHILD_SLOT: number = 2;
let LAST_CHILD_SLOT: number = 3;

function initialise_tag(allTag: number[], types: string[]): void {
  tags = allTag;
  typeTag = types;
}

function updateMemoryHeap(ops: string, newHeap: number[]): void {
  if (newHeap) {
    memory = [];
    for (let j = 0; j < newHeap.length; j += 1) {
      // eslint-disable-next-line no-param-reassign
      memory.push(newHeap[j]);
    }
    console.log('add new ', memoryHeaps.length, ' -- ', newHeap);
    memoryHeaps.push(memory);
    operationHeaps.push(ops);
    // heapStates.push(memoryHeaps);
  }
}

function allHeap(newHeap: number[][]): void {
  memoryHeaps = newHeap;
}

function updateFlip(): void {
  flips.push(commandHeap.length - 1);
}

function generateMemory(): void {
  toMemoryMatrix = [];
  for (let i = 0; i < ROW / 2; i += 1) {
    memory = [];
    for (let j = 0; j < COLUMN && i * COLUMN + j < MEMORY_SIZE / 2; j += 1) {
      // eslint-disable-next-line no-param-reassign
      memory.push(i * COLUMN + j);
    }
    toMemoryMatrix.push(memory);
  }

  fromMemoryMatrix = [];
  for (let i = ROW / 2; i < ROW; i += 1) {
    memory = [];
    for (let j = 0; j < COLUMN && i * COLUMN + j < MEMORY_SIZE; j += 1) {
      // eslint-disable-next-line no-param-reassign
      memory.push(i * COLUMN + j);
    }
    fromMemoryMatrix.push(memory);
  }

  const obj = {
    type: 'init',
    to: TO_SPACE,
    from: FROM_SPACE,
    heap: [],
    left: -1,
    right: -1,
    sizeLeft: 0,
    sizeRight: 0,
    desc: 'Memory initially empty.',
    leftDesc: '',
    rightDesc: '',
  };

  commandHeap.push(obj);
}

function resetToSpace(toSpace, heap): any {
  // eslint-disable-next-line prefer-const
  let newHeap: any[] = [];
  if (toSpace > 0) {
    for (let i = 0; i < MEMORY_SIZE / 2; i += 1) {
      newHeap.push(heap[i]);
    }
    for (let i = MEMORY_SIZE / 2; i < MEMORY_SIZE; i += 1) {
      newHeap.push(0);
    }
  } else {
    // to space between 0...M/2
    for (let i = 0; i < MEMORY_SIZE / 2; i += 1) {
      newHeap.push(0);
    }
    for (let i = MEMORY_SIZE / 2; i < MEMORY_SIZE; i += 1) {
      newHeap.push(heap[i]);
    }
  }
  return newHeap;
}

function initialize_memory(memorySize: number): void {
  MEMORY_SIZE = memorySize;
  ROW = MEMORY_SIZE / COLUMN;
  TO_SPACE = 0;
  FROM_SPACE = MEMORY_SIZE / 2;
  generateMemory();
  console.log('updating memory size ', MEMORY_SIZE);
}

function newCommand(
  type,
  toSpace,
  fromSpace,
  left,
  right,
  sizeLeft,
  sizeRight,
  heap,
  description,
  firstDesc,
  lastDesc
): void {
  const newType = type;
  const newToSpace = toSpace;
  const newFromSpace = fromSpace;
  const newLeft = left;
  const newRight = right;
  const newSizeLeft = sizeLeft;
  const newSizeRight = sizeRight;
  const newDesc = description;
  const newFirstDesc = firstDesc;
  const newLastDesc = lastDesc;

  memory = [];
  for (let j = 0; j < heap.length; j += 1) {
    // eslint-disable-next-line no-param-reassign
    memory.push(heap[j]);
  }

  const obj = {
    type: newType,
    to: newToSpace,
    from: newFromSpace,
    heap: memory,
    left: newLeft,
    right: newRight,
    sizeLeft: newSizeLeft,
    sizeRight: newSizeRight,
    desc: newDesc,
    leftDesc: newFirstDesc,
    rightDesc: newLastDesc,
  };

  commandHeap.push(obj);
}

function newCopy(left, right, heap): void {
  const { length } = commandHeap;
  const toSpace = commandHeap[length - 1].to;
  const fromSpace = commandHeap[length - 1].from;
  const newSizeLeft = heap[left + SIZE_SLOT];
  const newSizeRight = heap[right + SIZE_SLOT];
  const desc = `Copying node ${left} to ${right}`;
  newCommand(
    COMMAND.COPY,
    toSpace,
    fromSpace,
    left,
    right,
    newSizeLeft,
    newSizeRight,
    heap,
    desc,
    'index',
    'free'
  );
}

function newFlip(left, heap): void {
  const { length } = commandHeap;
  const fromSpace = commandHeap[length - 1].to;
  const toSpace = commandHeap[length - 1].from;
  const newSizeLeft = heap[left + SIZE_SLOT];
  const desc = 'Flip finished';
  newCommand(
    COMMAND.FLIP,
    toSpace,
    fromSpace,
    left,
    -1,
    newSizeLeft,
    0,
    heap,
    desc,
    'free',
    ''
  );
  updateFlip();
}

function startFlip(toSpace, fromSpace, heap): void {
  const desc = 'Memory is exhausted. Start stop and copy garbage collector.';
  newCommand(
    'Start of Cheneys',
    toSpace,
    fromSpace,
    -1,
    -1,
    0,
    0,
    heap,
    desc,
    '',
    ''
  );
  updateFlip();
}

function newPush(left, right, heap): void {
  const { length } = commandHeap;
  const toSpace = commandHeap[length - 1].to;
  const fromSpace = commandHeap[length - 1].from;
  const desc = `Push OS update memory ${left} and ${right}.`;
  newCommand(
    COMMAND.PUSH,
    toSpace,
    fromSpace,
    left,
    right,
    1,
    1,
    heap,
    desc,
    'last child address slot',
    'new child pushed'
  );
}

function newPop(res, left, right, heap): void {
  const { length } = commandHeap;
  const toSpace = commandHeap[length - 1].to;
  const fromSpace = commandHeap[length - 1].from;
  const newRes = res;
  const desc = `Pop OS from memory ${right}, with value ${newRes}.`;
  newCommand(
    COMMAND.POP,
    toSpace,
    fromSpace,
    left,
    right,
    1,
    1,
    heap,
    desc,
    'popped memory',
    'last child address slot'
  );
}

function newAssign(res, left, heap): void {
  const { length } = commandHeap;
  const toSpace = commandHeap[length - 1].to;
  const fromSpace = commandHeap[length - 1].from;
  const newRes = res;
  const desc = `Assign memory [${left}] with ${newRes}.`;
  newCommand(
    COMMAND.ASSIGN,
    toSpace,
    fromSpace,
    left,
    -1,
    1,
    1,
    heap,
    desc,
    'assigned memory',
    ''
  );
}

function newNew(left, heap): void {
  const { length } = commandHeap;
  const toSpace = commandHeap[length - 1].to;
  const fromSpace = commandHeap[length - 1].from;
  const newSizeLeft = heap[left + SIZE_SLOT];
  const desc = `New node starts in [${left}].`;
  newCommand(
    COMMAND.NEW,
    toSpace,
    fromSpace,
    left,
    -1,
    newSizeLeft,
    0,
    heap,
    desc,
    'new memory allocated',
    ''
  );
}

function scanFlip(left, right, scan, free, heap): void {
  const { length } = commandHeap;
  const toSpace = commandHeap[length - 1].to;
  const fromSpace = commandHeap[length - 1].from;
  memory = [];
  for (let j = 0; j < heap.length; j += 1) {
    // eslint-disable-next-line no-param-reassign
    memory.push(heap[j]);
  }

  const newLeft = left;
  const newRight = right;
  const newScan = scan;
  const newFree = free;
  const newDesc = `Scanning node at ${left} for children node from ${scan} to ${free}`;

  const obj = {
    type: COMMAND.SCAN,
    to: toSpace,
    from: fromSpace,
    heap: memory,
    left: newLeft,
    right: newRight,
    sizeLeft: 1,
    sizeRight: 1,
    scan: newScan,
    free: newFree,
    desc: newDesc,
    leftDesc: 'scan',
    rightDesc: 'free',
  };

  commandHeap.push(obj);
}

function updateSlotSegment(
  tag: number,
  size: number,
  first: number,
  last: number
): void {
  if (tag >= 0) {
    TAG_SLOT = tag;
  }
  if (size >= 0) {
    SIZE_SLOT = size;
  }
  if (first >= 0) {
    FIRST_CHILD_SLOT = first;
  }
  if (last >= 0) {
    LAST_CHILD_SLOT = last;
  }
}

function get_memory_size(): number {
  return MEMORY_SIZE;
}

function get_tags(): Tag[] {
  return tags;
}

function get_command(): any[] {
  return commandHeap;
}

function get_flips(): number[] {
  return flips;
}

function get_types(): String[] {
  return typeTag;
}

function get_from_space(): number {
  return FROM_SPACE;
}

function get_memory_heap(): MemoryHeaps {
  return memoryHeaps;
}

function get_to_memory_matrix(): MemoryHeaps {
  return toMemoryMatrix;
}

function get_from_memory_matrix(): MemoryHeaps {
  return fromMemoryMatrix;
}

function get_slots(): number[] {
  return [TAG_SLOT, SIZE_SLOT, FIRST_CHILD_SLOT, LAST_CHILD_SLOT];
}

function get_to_space(): number {
  return TO_SPACE;
}

function get_column_size(): number {
  return COLUMN;
}

function get_row_size(): number {
  return ROW;
}

function init() {
  return {
    toReplString: () => '<REDACTED>',
    get_memory_size,
    get_from_space,
    get_to_space,
    get_memory_heap,
    get_tags,
    get_types,
    get_column_size,
    get_row_size,
    get_from_memory_matrix,
    get_to_memory_matrix,
    get_flips,
    get_slots,
    get_command,
  };
}

export default function copy_gc() {
  return {
    init,
    // initialisation
    initialize_memory,
    initialise_tag,
    updateMemoryHeap,
    generateMemory,
    allHeap,
    updateSlotSegment,
    resetToSpace,
    newCommand,
    newCopy,
    newFlip,
    newPush,
    newPop,
    newAssign,
    newNew,
    scanFlip,
    startFlip,
  };
}

/*
import { 
    copy_gc, 
    update, 
    initialise_memory, 
    init, 
    updateMemoryHeap,
    initialise_tag,
    updateFlip
} from "copy_gc"; 

initialise_memory(200);
update(0, 28);
updateMemoryHeap([20,53,65,13]);
updateFlip();
updateMemoryHeap([20,5,65,23]);
updateMemoryHeap([2,523,15,143]);
updateMemoryHeap([20,53,65,23]);
updateFlip();
updateMemoryHeap([2,523,15,143]);
updateMemoryHeap([20,5,65,23]);
initialise_tag([53,23], ['hallo', 'int']);

init();


// general node layout
const TAG_SLOT = 0;
const SIZE_SLOT = 1;
const FIRST_CHILD_SLOT = 2;
const LAST_CHILD_SLOT = 3;

*/
