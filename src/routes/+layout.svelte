<script lang="ts">
  import '../app.scss';
  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();
</script>

<svelte:head>
  <title>Meal Log | EMF Volunteer Kitchen</title>
</svelte:head>

{@render children?.()}
