export const getSoftDeletedBy = (ctx: any) => {
  const authId: number | null = ctx.state.auth.credentials?.id || null
  const authStrategy: string = ctx.state.auth.strategy.name

  return { authId, authStrategy }
};
