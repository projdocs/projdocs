export type DisplayableErrorProps = {
  title: string
  description?: string
}

export class DisplayableError extends Error {
  private title: string
  private description: string | undefined

  constructor(
    title: DisplayableErrorProps["title"],
    description?: DisplayableErrorProps["description"]
  ) {
    super()
    this.title = title
    this.description = description
  }

  public toError(): Error {
    return Error(
      JSON.stringify({
        title: this.title,
        description: this.description,
      } as DisplayableErrorProps)
    )
  }

  public static fromError(err: Error): DisplayableError | null {
    if (err instanceof DisplayableError) {
      return err
    }

    try {
      const props = JSON.parse(err.message)
      if (
        typeof (props as DisplayableErrorProps)?.title === "string" &&
        (typeof (props as DisplayableErrorProps)?.description === "string" ||
          typeof (props as DisplayableErrorProps)?.description === "undefined")
      )
        return new DisplayableError(
          (props as DisplayableErrorProps)?.title,
          (props as DisplayableErrorProps)?.description
        )
      return null
    } catch (e) {
      console.log("unable to parse error", e)
      return null
    }
  }

  public static is(obj: any): boolean {
    if (obj instanceof DisplayableError) return true
    return (
      typeof obj?.["Title"] === "function" &&
      typeof obj?.["Description"] === "function"
    )
  }

  public Title(): string {
    return this.title
  }

  public Description(): string | undefined {
    return this.description
  }
}
