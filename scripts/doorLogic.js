import { blocks } from "./blocks.js";

export const DoorLogic = {
  /**
   * 2. Placement Logic
   * Checks for space and places both halves of the door with their respective states.
   */
  placeDoor: (world, x, y, z, facing_direction) => {
    const bottomBlock = world.getBlock(x, y, z);
    const topBlock = world.getBlock(x, y + 1, z);

    // Condition Check: Ensure both target blocks are empty (or replaceable)
    if (
      !bottomBlock ||
      bottomBlock.id !== blocks.empty.id ||
      !topBlock ||
      topBlock.id !== blocks.empty.id
    ) {
      console.warn("Not enough vertical space to place door.");
      return false;
    }

    // Execution: Place lower block
    world.addBlock(x, y, z, blocks.wooden_door.id);
    world.setBlockState(x, y, z, {
      is_top_half: false,
      is_open: false,
      facing_direction: facing_direction,
    });

    // Execution: Place upper block
    world.addBlock(x, y + 1, z, blocks.wooden_door.id);
    world.setBlockState(x, y + 1, z, {
      is_top_half: true,
      is_open: false,
      facing_direction: facing_direction,
    });

    return true;
  },

  /**
   * 3. Interaction Logic (Opening & Closing)
   * Toggles the clicked door and automatically finds and toggles its partner.
   */
  toggleDoor: (world, x, y, z) => {
    const block = world.getBlock(x, y, z);
    const state = world.getBlockState(x, y, z);

    if (!block || block.id !== blocks.wooden_door.id || !state) return;

    // 1. Read current state and reverse it
    const newOpenState = !state.is_open;

    // Update clicked block
    world.setBlockState(x, y, z, { is_open: newOpenState });

    // 2 & 3. Check is_top_half to find partner block
    const partnerY = state.is_top_half ? y - 1 : y + 1;

    // 4. Update partner block
    const partnerState = world.getBlockState(x, partnerY, z);
    if (partnerState) {
      world.setBlockState(x, partnerY, z, { is_open: newOpenState });
    }

    // Trigger visual update (recalculate meshes/matrices for open/closed visual state)
    world.updateMesh();
  },

  /**
   * 4. Destruction Logic (Breaking)
   * Destroys both halves and drops a single item.
   */
  breakDoor: (world, x, y, z) => {
    const block = world.getBlock(x, y, z);
    const state = world.getBlockState(x, y, z);

    if (!block || block.id !== blocks.wooden_door.id || !state) return;

    // 1 & 2. Check is_top_half to find partner block
    const partnerY = state.is_top_half ? y - 1 : y + 1;

    // Destroy clicked block
    world.removeBlock(x, y, z);
    world.setBlockState(x, y, z, null);

    // Destroy partner block
    world.removeBlock(x, partnerY, z);
    world.setBlockState(x, partnerY, z, null);

    // Drop Item Logic: Calculate the bottom block's position to spawn the drop
    const dropY = state.is_top_half ? y - 1 : y;

    // Assuming you have a generic item drop function in your world:
    // world.spawnItemDrop(blocks.wooden_door.id, x, dropY, z);

    world.updateMesh();
  },
};
