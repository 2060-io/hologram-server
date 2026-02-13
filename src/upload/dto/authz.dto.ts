export class AuthzRequestDto {
  input!: AuthzInputDto
}

export class AuthzInputDto {
  account!: string
  groups?: string[] | null

  action!: string
  originalAction?: string

  bucket?: string
  object?: string

  owner?: boolean
  denyOnly?: boolean

  conditions?: Record<string, string[]>

  claims?: AuthzClaimsDto
}

export class AuthzClaimsDto {
  accessKey!: string
  exp!: number
  parent?: string
}
