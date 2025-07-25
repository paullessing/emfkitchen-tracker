<script lang="ts">
  interface Props {
    isOpen?: boolean;
    children?: import('svelte').Snippet;
  }

  let { isOpen = false, children }: Props = $props();
</script>

{#if isOpen}
  <div class="modal">
    <div class="modal__container">
      {@render children?.()}
    </div>
  </div>
{/if}

<style lang="scss">
  @import '../../variables';

  .modal {
    $root: &;

    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background-color: rgba(black, 0.3);

    &__container {
      position: absolute;
      left: 50%;
      width: 80vw;
      max-width: 1000px;
      top: 50%;
      transform: translate(-50%, -50%);

      background: $dark-green;
      box-shadow: 0 0 2rem 1rem rgba(white, 0.4);
      padding: 8rem;
      text-align: center;
      border-radius: 0.5rem;

      display: flex;
      flex-direction: column;
    }
  }
</style>
