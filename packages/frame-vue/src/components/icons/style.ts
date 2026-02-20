export interface IconProps {
    borderSize?: number | string
    borderColor?: string
    backgroundColor?: string
    foregroundColor?: string
}

export function getDefaultIconProps(): Required<IconProps> {
    return {
        borderSize: 2,
        borderColor: 'rgba(255, 255, 255, .85)',
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        foregroundColor: 'rgba(255, 255, 255, .85)',
    }
}

export const defaultIconProps = getDefaultIconProps()
